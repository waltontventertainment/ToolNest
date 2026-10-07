import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RotateCw, 
  Video, 
  Briefcase, 
  ShoppingBag, 
  Users, 
  BookOpen, 
  Calculator, 
  GraduationCap, 
  Globe2, 
  Utensils, 
  Scale, 
  FileText, 
  Wand2,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { runAutoAiCompletion } from '../lib/aiService';
import { toast } from 'sonner';

// Reusable live streaming status & progress component
export const AiStreamingStatus: React.FC<{ loading: boolean; status: string; wordCount?: number }> = ({ loading, status, wordCount }) => {
  if (!loading && !status) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/30 text-xs font-semibold text-blue-600 dark:text-blue-400 shadow-xs transition-all">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
      <span className="truncate max-w-[280px] sm:max-w-none">{status || 'Generating in real-time...'}</span>
      {typeof wordCount === 'number' && wordCount > 0 && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
          {wordCount}w
        </span>
      )}
    </div>
  );
};

export const AiLiveCursor: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle rounded-xs" />;
};

// ============================================================================
// 11. AI YouTube & Video Script Generator
// ============================================================================
export const AiYoutubeScriptGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [videoType, setVideoType] = useState('YouTube Full Video (8-10 min)');
  const [targetAudience, setTargetAudience] = useState('General tech & creator audience');
  const [tone, setTone] = useState('High-energy & entertaining');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a video topic or title idea.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Analyzing video concept...');

    const prompt = `Write a comprehensive, professional video production script for the following topic:
Video Title/Topic: "${topic}"
Format: ${videoType}
Target Audience: ${targetAudience}
Tone: ${tone}

Please format the script in structured Markdown with:
1. 3 Viral Hook & Title Ideas (optimized for YouTube algorithm and high CTR)
2. Compelling 15-second Intro (problem statement + promise)
3. Scene-by-Scene Script Breakdown with:
   - [TIMESTAMP / SCENE]
   - [VISUAL / B-ROLL INSTRUCTION]
   - [VOICEOVER / HOST DIALOGUE]
4. Call to Action (CTA) & Subscribe Hook
5. Optimized Outro & End Screen Placement Recommendations.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a top YouTube strategist and documentary scriptwriter. Write engaging, retention-optimized scripts with clear visual and audio cues.',
      temperature: 0.7,
      maxTokens: 3000,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('YouTube script generated successfully!');
    } else {
      toast.error(res.error || 'Failed to generate script.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${topic.slice(0, 25).toLowerCase().replace(/[^a-z0-9]/g, '-') || 'video'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Script downloaded as Markdown!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Video className="w-4 h-4" />
            <span>Video Concept & Style</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Video Topic or Main Idea <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How AI agents will replace traditional apps in 2026..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Video Format</label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="YouTube Long Video (8-12 min)">YouTube Video (8-12 min)</option>
                <option value="YouTube Shorts / TikTok (60s)">YouTube Shorts / TikTok (60s)</option>
                <option value="Explainer / Tutorial">Explainer / Tutorial</option>
                <option value="Documentary & Storytelling">Documentary Style</option>
                <option value="Podcast / Interview Outline">Podcast / Interview</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Tone & Pacing</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="High-energy & entertaining">High-Energy & Viral</option>
                <option value="Informative & Educational">Educational & Clear</option>
                <option value="Cinematic & Dramatic">Cinematic & Deep</option>
                <option value="Conversational & Relatable">Casual & Chill</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Target Viewers</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Developers, students, tech enthusiasts"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Streaming Script...' : 'Generate Full Video Script'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Production Script</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button onClick={downloadScript} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Download .md</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Video className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Your video script will generate in real time</p>
                <p className="text-[11px] max-w-xs mt-1">Get hook ideas, B-roll visuals, dialogue timestamps, and call-to-actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 12. AI Resume & LinkedIn Bio Builder
// ============================================================================
export const AiResumeBioBuilder: React.FC = () => {
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [format, setFormat] = useState('Full Resume Section & Bullets');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!role.trim()) {
      toast.error('Please enter your target job role or current title.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Crafting high-impact executive bullets...');

    const prompt = `Write a high-impact, ATS-optimized professional resume summary and bullet points for:
Target Job Title: "${role}"
Experience Background: "${experience || '3+ years relevant industry experience'}"
Core Skills / Tools: "${skills || 'Leadership, problem solving, agile workflows'}"
Target Output Format: ${format}

Please provide:
1. 2 High-Impact Executive Summaries (Tailored for LinkedIn 'About' & Resume Header)
2. 8-10 Metric-Driven Action Bullets (using XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]")
3. Categorized Core Competencies & Keywords for ATS scanning
4. Tailored Cover Letter Opener paragraph.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an executive career coach and elite recruiter. Write high-converting, metric-driven resume content that passes ATS algorithms and impresses hiring managers.',
      temperature: 0.6,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Resume bullets generated!');
    } else {
      toast.error(res.error || 'Failed to generate resume.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Briefcase className="w-4 h-4" />
            <span>Career Details</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Target Role / Job Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Senior Full-Stack Engineer / Product Manager"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Brief Experience & Accomplishments</label>
            <textarea
              rows={3}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g., Built high-scale React/Node microservices, reduced API latency by 40%, led team of 5 engineers..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Top Skills & Technologies</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., TypeScript, Next.js, PostgreSQL, Docker, AWS, UI/UX"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Building Resume...' : 'Generate ATS-Ready Content'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Resume & Bio Package</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Briefcase className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">ATS-optimized bullets will stream in real time</p>
                <p className="text-[11px] max-w-xs mt-1">Get XYZ-formula accomplishment bullets and LinkedIn summary bios.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 13. AI E-Commerce Product Description Writer
// ============================================================================
export const AiProductDescription: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [platform, setPlatform] = useState('Shopify & Custom Store');
  const [tone, setTone] = useState('High-converting & Luxurious');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Generating high-converting copywriting...');

    const prompt = `Write an irresistible, high-converting product sales copy for:
Product Name: "${productName}"
Key Features & Specs: "${features || 'Premium materials, durable, ergonomic design, eco-friendly'}"
Target Marketplace: ${platform}
Brand Tone: ${tone}

Please provide:
1. 3 Catchy Product Headlines / Slogans
2. Compelling Emotional Opening Story & Problem/Solution Angle
3. 5 Benefit-Driven Feature Bullets (highlighting how each solves customer pain)
4. Technical Specifications Table / Summary
5. Trust Badges & Risk-Reversal Guarantee copy (30-day guarantee, warranty)
6. 15 High-Search E-Commerce SEO Keywords.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a master direct-response copywriter for top 7-figure Shopify & Amazon brands. Write vivid, emotional, benefit-driven product copy that sells.',
      temperature: 0.7,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Product copy generated!');
    } else {
      toast.error(res.error || 'Failed to generate product description.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <ShoppingBag className="w-4 h-4" />
            <span>Product Details</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Product Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Ultra-Slim Ergonomic Mechanical Keyboard"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Key Features / Specs</label>
            <textarea
              rows={3}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g., Wireless Bluetooth 5.3, RGB backlighting, 80-hour battery life, aluminum frame, hot-swappable switches..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Marketplace</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Shopify & Custom Store">Shopify / Website</option>
                <option value="Amazon Listing (Bullet Points)">Amazon Listing</option>
                <option value="Etsy (Handmade & Story)">Etsy</option>
                <option value="eBay / Marketplace">eBay / Marketplace</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Copywriting Style</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="High-converting & Luxurious">Luxury & Premium</option>
                <option value="Bold & Direct-Response">Bold & Urgent</option>
                <option value="Minimalist & Modern">Clean & Minimalist</option>
                <option value="Playful & Fun">Playful & Witty</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Crafting Sales Copy...' : 'Generate Product Copy'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Product Sales Copy</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <ShoppingBag className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Persuasive product copy will stream live</p>
                <p className="text-[11px] max-w-xs mt-1">Get benefit-driven feature bullets, emotional hooks, and SEO keywords.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 14. AI Job Interview Question & STAR Answer Coach
// ============================================================================
export const AiInterviewPrep: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [interviewType, setInterviewType] = useState('Behavioral & Situational');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      toast.error('Please enter the target job title.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Simulating hiring manager questions and STAR answers...');

    const prompt = `Act as an elite interview coach and hiring director. Prepare a complete mock interview cheat-sheet for:
Target Position: "${jobTitle}"
Target Company / Industry: "${company || 'Top tech / modern corporate enterprise'}"
Interview Focus: ${interviewType}

Please provide:
1. Top 5 Most Challenging & Expected Interview Questions
2. For each question, provide:
   - What the interviewer is secretly testing for
   - A perfect Model Answer using the STAR Method (Situation, Task, Action, Result)
   - Common traps/mistakes to avoid
3. 3 Smart Questions for the candidate to ask the interviewer at the end of the interview.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an executive recruiter and interview coach. Provide realistic, structured STAR-method interview answers with high-impact vocabulary.',
      temperature: 0.6,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Interview prep guide created!');
    } else {
      toast.error(res.error || 'Failed to generate interview prep.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>Interview Setup</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Target Job Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Engineer / Product Designer"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Company / Industry (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google, Fintech Startup, Healthcare"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Interview Round</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            >
              <option value="Behavioral & Situational (STAR)">Behavioral & Situational (STAR)</option>
              <option value="Technical & System Design">Technical & Architecture</option>
              <option value="Leadership & Executive Management">Leadership & Management</option>
              <option value="HR Screening & Salary Negotiation">HR Screening & Salary</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Preparing Answers...' : 'Generate Interview Answers'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Interview Q&A Guide</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Users className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">STAR method mock answers will appear in real time</p>
                <p className="text-[11px] max-w-xs mt-1">Get targeted questions, proven answers, and questions to ask the interviewer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 15. AI Creative Story & Plot Generator
// ============================================================================
export const AiStoryPlotGenerator: React.FC = () => {
  const [premise, setPremise] = useState('');
  const [genre, setGenre] = useState('Sci-Fi & Cyberpunk');
  const [format, setFormat] = useState('Full Chapter / Short Story');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!premise.trim()) {
      toast.error('Please enter a story premise or concept.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('World-building and character drafting...');

    const prompt = `Write an immersive, original creative fiction story for:
Premise / Core Idea: "${premise}"
Genre: ${genre}
Format: ${format}

Please craft:
1. Title & High-Concept Logline
2. Character Profiles (Protagonist, Antagonist, Motivations & Flaws)
3. Three-Act Narrative Arc (Inciting Incident, Climax, Resolution)
4. An engaging, descriptive sample chapter with dynamic dialogue, sensory world-building, and high narrative tension.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a master fiction novelist and screenwriter. Write vivid sensory descriptions, believable character voices, and gripping narrative pacing.',
      temperature: 0.85,
      maxTokens: 3000,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Creative story generated!');
    } else {
      toast.error(res.error || 'Failed to generate story.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Story copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Story Premise</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Core Concept / Hook <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="e.g., A clockmaker discovers that winding backwards a forbidden antique watch reverses time for everyone except him..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Sci-Fi & Cyberpunk">Sci-Fi & Cyberpunk</option>
                <option value="Fantasy & Magic">Fantasy & Magic</option>
                <option value="Mystery & Thriller">Mystery & Thriller</option>
                <option value="Horror & Supernatural">Horror & Dark</option>
                <option value="Romance & Drama">Romance & Drama</option>
                <option value="Historical Fiction">Historical Fiction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Full Short Story">Full Short Story</option>
                <option value="Opening Chapter">Opening Chapter</option>
                <option value="Plot Outline & Twists">Plot Arc & Twists</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Weaving Tale...' : 'Generate Creative Story'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Story Output</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-serif">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <BookOpen className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Your generated fiction story will stream in real time</p>
                <p className="text-[11px] max-w-xs mt-1">Get rich narrative prose, dialogue scenes, and character arcs.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 16. AI Step-by-Step Math & Logic Solver
// ============================================================================
export const AiMathProblemSolver: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [level, setLevel] = useState('High School / College Calculus');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSolve = async () => {
    if (!problem.trim()) {
      toast.error('Please enter a math equation or word problem.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Computing equations and step-by-step logic...');

    const prompt = `Solve the following math or logic problem with clear, rigorous, step-by-step reasoning:
Problem: "${problem}"
Difficulty / Domain: ${level}

Please format output in structured Markdown with:
1. Final Answer in bold at the top
2. Key Formulas & Theorems Applied
3. Step-by-Step Derivation & Calculations (with clear explanations for each step)
4. Verification & Sanity Check (plugging solution back in)
5. Alternative intuitive or shortcut method (if applicable).`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an expert mathematics professor. Provide crystal-clear, rigorous step-by-step solutions with LaTeX notation and easy-to-understand explanations.',
      temperature: 0.2,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Math problem solved!');
    } else {
      toast.error(res.error || 'Failed to solve problem.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Solution copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Calculator className="w-4 h-4" />
            <span>Problem Input</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Math Equation / Word Problem <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g., Integrate (3x^2 + 5x) e^(2x) dx or: A train leaves Station A at 60 mph..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Subject Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            >
              <option value="High School Algebra & Geometry">Algebra & Geometry</option>
              <option value="Calculus & Differential Equations">Calculus & Differential Equations</option>
              <option value="Probability & Statistics">Probability & Statistics</option>
              <option value="Linear Algebra & Matrices">Linear Algebra & Matrices</option>
              <option value="Physics & Engineering Mechanics">Physics & Engineering</option>
              <option value="Financial Mathematics (Compound Interest, ROI)">Financial Math</option>
            </select>
          </div>

          <button
            onClick={handleSolve}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Solving Step-by-Step...' : 'Solve Math Problem'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Step-by-Step Solution</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto font-mono">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6 font-sans">
                <Calculator className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Step-by-step mathematical proof will stream live</p>
                <p className="text-[11px] max-w-xs mt-1">Get formulas, breakdowns, and verification steps in real time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 17. AI Quiz & Flashcard Generator
// ============================================================================
export const AiQuizFlashcardMaker: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('5 Questions');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a study topic or text passage.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Generating interactive multiple-choice quiz...');

    const prompt = `Create a high-quality study quiz and flashcard set for:
Topic / Study Material: "${topic}"
Number of Questions: ${numQuestions}
Difficulty: ${difficulty}

Please structure as:
1. Multiple Choice Questions (4 options A, B, C, D each, with the correct answer hidden below an explanation)
2. 5 Flashcards (Front: Concept/Term | Back: Definition & Example)
3. Key Summary Takeaways to memorize for exams.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an educational designer and test-prep specialist. Create clear, engaging multiple choice questions and flashcards with explanations.',
      temperature: 0.6,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Quiz & Flashcards generated!');
    } else {
      toast.error(res.error || 'Failed to generate quiz.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <GraduationCap className="w-4 h-4" />
            <span>Study Topic Info</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Topic or Paste Study Text <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis and the Calvin Cycle in biology or: AWS Cloud Architecture concepts..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Count</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="5 Questions">5 Questions</option>
                <option value="10 Questions">10 Questions</option>
                <option value="15 Questions">15 Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Beginner / General">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced / Exam Level">Advanced / Exam</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Creating Quiz...' : 'Generate Quiz & Flashcards'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Quiz & Study Cards</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <GraduationCap className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Interactive quiz questions will appear here</p>
                <p className="text-[11px] max-w-xs mt-1">Get flashcards, multiple-choice questions, and answer rationales.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 18. AI Startup & Brand Name Generator
// ============================================================================
export const AiDomainStartupNamer: React.FC = () => {
  const [description, setDescription] = useState('');
  const [vibe, setVibe] = useState('Modern Tech & SaaS (like Stripe, Vercel)');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please describe what your startup or product does.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Brainstorming punchy brand names and taglines...');

    const prompt = `Brainstorm 15 catchy, memorable, brandable company/product names for:
Product / Startup Idea: "${description}"
Naming Style / Brand Vibe: ${vibe}

For each recommendation provide:
1. Brand Name (Punchy, easy to spell, memorable)
2. Available Domain Extensions ideas (.com, .io, .ai, .app, .co)
3. Punchy One-Line Slogan / Tagline
4. The linguistic rationale / psychology behind the name.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a world-class branding consultant and naming agency director. Generate distinctive, pronounceable, modern names without generic clichés.',
      temperature: 0.85,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Brand names generated!');
    } else {
      toast.error(res.error || 'Failed to generate names.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Globe2 className="w-4 h-4" />
            <span>Brand Vibe</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Startup / Product Concept <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., An AI-powered personal accounting app that automatically files taxes and finds tax deductions for freelancers..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Naming Style</label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            >
              <option value="Modern Tech & SaaS (like Stripe, Vercel, Linear)">Modern SaaS (Stripe, Linear)</option>
              <option value="Short & Punchy 4-5 letter coined words">Short 4-5 Letter Coined Names</option>
              <option value="Playful & Friendly (like Slack, Mailchimp)">Playful (Slack, Mailchimp)</option>
              <option value="Prestigious & Elite (like Apex, Quantum, Vanguard)">Prestigious & Elite</option>
              <option value="Compound Words (like DropBox, YouTube, ToolNest)">Compound Words (ToolNest)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Brainstorming Names...' : 'Generate Startup Names & Slogans'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Brand Name Candidates</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Globe2 className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Brandable startup names will stream live</p>
                <p className="text-[11px] max-w-xs mt-1">Get creative names, domain extensions, and catchy taglines in seconds.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 19. AI Smart Recipe & Meal Planner
// ============================================================================
export const AiRecipeMealPlanner: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [diet, setDiet] = useState('High Protein / Fitness');
  const [prepTime, setPrepTime] = useState('Quick (under 25 mins)');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      toast.error('Please enter available ingredients or your meal goal.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Crafting gourmet recipes and nutritional breakdown...');

    const prompt = `Create a delicious, healthy custom recipe based on these ingredients:
Available Ingredients: "${ingredients}"
Dietary Preference: ${diet}
Cooking Time Limit: ${prepTime}

Please format in structured Markdown:
1. Creative Recipe Title & Description
2. Prep Time, Cook Time, Servings, and Estimated Calories/Macros (Protein, Carbs, Fats)
3. Complete Ingredient List with precise measurements
4. Step-by-Step Cooking Instructions (numbered, easy to follow)
5. Chef Tips & Healthy Ingredient Substitutions.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a professional executive chef and certified nutritionist. Write appetizing, practical recipes with clear culinary instructions and accurate macro estimates.',
      temperature: 0.7,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Recipe generated!');
    } else {
      toast.error(res.error || 'Failed to generate recipe.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Recipe copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Utensils className="w-4 h-4" />
            <span>Kitchen Ingredients</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Available Ingredients in Fridge/Pantry <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., Chicken breast, eggs, spinach, garlic, olive oil, rice, soy sauce..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Diet Style</label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="High Protein / Fitness">High Protein</option>
                <option value="Keto / Low Carb">Keto / Low Carb</option>
                <option value="Vegetarian / Plant-Based">Vegetarian</option>
                <option value="Vegan / Dairy-Free">Vegan</option>
                <option value="Balanced / Comfort Food">Balanced / Comfort</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Max Prep Time</label>
              <select
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Quick (under 15 mins)">Under 15 mins</option>
                <option value="Standard (under 30 mins)">Under 30 mins</option>
                <option value="Gourmet (45+ mins)">Gourmet (45+ mins)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Cooking Recipe...' : 'Generate Recipe & Macros'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Chef Recipe & Instructions</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Utensils className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Custom recipe and macros will appear here</p>
                <p className="text-[11px] max-w-xs mt-1">Transform pantry leftovers into delicious, nutritious meals in minutes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 20. AI Legal Contract & Terms of Service Explainer
// ============================================================================
export const AiContractLegalExplainer: React.FC = () => {
  const [legalText, setLegalText] = useState('');
  const [contractType, setContractType] = useState('Terms of Service / Privacy Policy');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExplain = async () => {
    if (!legalText.trim()) {
      toast.error('Please paste the contract or terms text.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Auditing legal clauses, privacy terms, and red flags...');

    const prompt = `Analyze and summarize the following legal agreement / contract in plain English:
Contract/Terms Text: "${legalText}"
Document Type: ${contractType}

Please structure as:
1. Executive TL;DR Summary in Plain English (What you are actually agreeing to)
2. ⚠️ Potential Red Flags & Hidden Traps (Auto-renewals, arbitration clauses, IP assignment, liability limitations, data selling)
3. Key Rights & Obligations Breakdown (What you can do vs. What the other party can do)
4. Cancellation & Termination Rules
5. Overall Safety Rating & Risk Level (Low, Medium, High).`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an experienced legal auditor. Translate complex legalese into clear, easy-to-understand plain English while pointing out hidden risks.',
      temperature: 0.3,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Legal analysis completed!');
    } else {
      toast.error(res.error || 'Failed to analyze contract.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Summary copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Scale className="w-4 h-4" />
            <span>Legal Document</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Paste Legal Contract / Terms Text <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={5}
              value={legalText}
              onChange={(e) => setLegalText(e.target.value)}
              placeholder="e.g., Paste user agreement, freelance client contract, NDA, or software terms of service..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Document Category</label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            >
              <option value="Terms of Service & Privacy Policy">Terms of Service / Privacy Policy</option>
              <option value="Freelance / Client Service Agreement">Freelance / Contractor Agreement</option>
              <option value="Employment Contract & Non-Compete">Employment / Non-Compete</option>
              <option value="Non-Disclosure Agreement (NDA)">Non-Disclosure Agreement (NDA)</option>
              <option value="SaaS Subscription Agreement">SaaS / Software License</option>
            </select>
          </div>

          <button
            onClick={handleExplain}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Auditing Legalese...' : 'Explain in Plain English'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Plain-English Breakdown</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Scale className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Plain-English legal breakdown will stream live</p>
                <p className="text-[11px] max-w-xs mt-1">Discover hidden red flags, IP clauses, and termination terms instantly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
