import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { 
  Mail, MessageSquare, ShieldCheck, FileText, Info, Sparkles, 
  Lock, Scale, AlertTriangle, CheckCircle2, Globe, Wrench, Send, Copy, Check,
  Zap, Cpu, UserCheck, HelpCircle, BookOpen, Shield, Award, Terminal, Layers, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { tools, categories } from '../lib/registry';
import { BUILTIN_BLOG_POSTS } from '../lib/blogData';
import { getToolUrl, getCategoryUrl, getBlogUrl, getBlogPostUrl } from '../lib/appUrls';

const PageHeader = ({ title, subtitle, date }: { title: string; subtitle?: string; date?: string }) => (
  <div className="mb-6 sm:mb-8 md:mb-10 text-center md:text-left border-b border-border/60 pb-4 sm:pb-6">
    <div className="mb-3 sm:mb-4">
      <BreadcrumbNavigation items={[{ label: title }]} />
    </div>
    <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-extrabold tracking-tight mb-2 sm:mb-3 text-foreground">{title}</h1>
    {subtitle && <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>}
    {date && <p className="text-xs text-muted-foreground/80 mt-2 font-mono">Last Updated: {date}</p>}
  </div>
);

export const About: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 md:space-y-12">
    <Seo 
      title={`About Toolzaro – ${tools.length}+ Privacy-First Online Developer & Utility Tools`} 
      description={`Learn about Toolzaro’s client-first engineering architecture. Discover how our ${tools.length}+ free browser utilities process PDFs, images, and code 100% locally with zero uploads.`}
      keywords={['about Toolzaro', 'client-side web tools', 'privacy-first online utilities', 'zero-knowledge browser tools']}
      url="https://toolzaro.cyou/about"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Toolzaro',
        url: 'https://toolzaro.cyou/about',
        description: `Toolzaro is a free, privacy-first suite of ${tools.length}+ client-side web utilities for developers, designers, and creators.`
      }}
    />
    
    <PageHeader 
      title="About Toolzaro" 
      subtitle={`Building the ultimate browser-native toolbox with ${tools.length} live utilities for developers, designers, students, and creators.`}
      date="October 2026"
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      <div className="p-5 sm:p-6 bg-card border border-border/80 rounded-2xl shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-base mb-2">100% Private & Secure</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your files, text inputs, code snippets, and photos never leave your device. All computation executes locally inside your browser memory.
        </p>
      </div>

      <div className="p-5 sm:p-6 bg-card border border-border/80 rounded-2xl shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-base mb-2">Zero Registration Barrier</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          No mandatory signups, no credit cards, and no paywalls. Open any tool and complete your work immediately with zero friction.
        </p>
      </div>

      <div className="p-5 sm:p-6 bg-card border border-border/80 rounded-2xl shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-4">
          <Wrench className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-base mb-2">{tools.length} Production Utilities</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Covering developer formatters, image studios, PDF workflows, unit converters, and cryptographic generators across {categories.length} categories.
        </p>
      </div>
    </div>

    {/* Comprehensive Architecture & Philosophy */}
    <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2">
        <Cpu className="w-6 h-6 text-primary" /> Architecture & Client-First Engineering
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        Conventional web utility sites routinely require users to transmit confidential files, source code, photos, or password strings to remote cloud servers. This introduces bandwidth delays, server queue latency, and grave privacy vulnerabilities.
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <strong>Toolzaro is engineered around a strict client-first paradigm.</strong> By harnessing standard modern browser APIs—including the HTML5 Canvas API, Web Cryptography SubtleCrypto API, WebAssembly (WASM), CSS Color Module Level 4 algorithms, and JavaScript ES2024 state engines—<strong>all computation occurs 100% on your local CPU and GPU.</strong>
      </p>

      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Zero Cloud File Retention</div>
            <div className="text-xs text-muted-foreground">Uploaded images or confidential documents never touch an external backend server.</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Instant Hardware Acceleration</div>
            <div className="text-xs text-muted-foreground">Zero network latency; operations process at native device speed.</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Offline Functionality</div>
            <div className="text-xs text-muted-foreground">Once cached in your browser session, tools run smoothly without active internet.</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Universal Cross-Platform Access</div>
            <div className="text-xs text-muted-foreground">Optimized for desktop workstations, laptops, tablets, and mobile devices alike.</div>
          </div>
        </div>
      </div>
    </section>

    {/* Editorial Standards & E-E-A-T Commitment */}
    <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2">
        <Award className="w-6 h-6 text-amber-500" /> Editorial Standards & Quality Commitment
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        Toolzaro is maintained by a dedicated team of software engineers, technical SEO consultants, and systems architects. Every utility undergoes rigorous automated and manual validation against official IEEE, W3C, ISO, and NIST specifications.
      </p>
      <div className="grid sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
          <p className="font-bold text-xs text-foreground">Mathematical Precision</p>
          <p className="text-[11px] text-muted-foreground">Converters and calculators use verified scientific constants and IEEE 754 precision correction.</p>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
          <p className="font-bold text-xs text-foreground">Standards Compliance</p>
          <p className="text-[11px] text-muted-foreground">Barcode, QR, and cryptographic tools strictly adhere to ISO/IEC 18004 and FIPS standards.</p>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
          <p className="font-bold text-xs text-foreground">Continuous Verification</p>
          <p className="text-[11px] text-muted-foreground">Our engineering team continuously updates tools based on user feedback and security audits.</p>
        </div>
      </div>
    </section>

    <AdSlot slot="static-about-bottom" format="auto" />
  </div>
);

export const Contact: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const email = "sabbirhasansh321@gmail.com";
  const whatsappNumber = "+8801908567684";
  const whatsappLink = "https://wa.me/8801908567684";

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    toast.success("Email address copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <Seo 
        title="Contact Us – Support, Bug Reports & Custom Tool Requests | Toolzaro" 
        description="Get in touch with the Toolzaro engineering desk via Gmail or WhatsApp for technical support, bug reports, partnership inquiries, and custom online tool requests."
        keywords={['contact Toolzaro', 'Toolzaro support', 'request custom online tool', 'report bug Toolzaro']}
        url="https://toolzaro.cyou/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Toolzaro Support',
          url: 'https://toolzaro.cyou/contact',
          description: 'Direct email and WhatsApp support desk for Toolzaro users and developers.'
        }}
      />
      
      <PageHeader 
        title="Contact Us" 
        subtitle="Have feedback, bug reports, feature requests, or custom tool suggestions? Connect directly with our team!"
        date="October 2026"
      />

      {/* Main Contact Channels */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Card */}
        <div className="p-8 bg-card border border-border/80 rounded-3xl shadow-xs flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                Primary Support Email
              </span>
              <h3 className="text-xl font-bold text-foreground mt-2">Email Inquiry</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                For detailed technical queries, bug reports, partnership proposals, and commercial feedback. Guaranteed response within 12 to 24 hours.
              </p>
            </div>
            
            <div className="p-3.5 bg-secondary/80 rounded-2xl font-mono text-xs font-bold text-foreground break-all border border-border/80 flex items-center justify-between gap-2 shadow-2xs">
              <span className="text-primary font-bold">{email}</span>
              <button 
                onClick={copyEmail}
                className="p-1.5 rounded-xl bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-border cursor-pointer"
                title="Copy Email"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <a 
            href={`mailto:${email}`}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Email Now</span>
          </a>
        </div>

        {/* WhatsApp Card */}
        <div className="p-8 bg-card border border-border/80 rounded-3xl shadow-xs flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 bg-emerald-200 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 font-extrabold">
                Instant Chat Support
              </span>
              <h3 className="text-xl font-bold text-foreground mt-2">WhatsApp Support</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Chat directly with our development desk on WhatsApp for rapid feedback, urgent bug reports, or quick tool suggestions.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/90 rounded-2xl font-mono text-sm font-extrabold text-emerald-950 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between shadow-2xs">
              <span className="tracking-wide">{whatsappNumber}</span>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                Active Desk
              </span>
            </div>
          </div>

          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp Directly</span>
          </a>
        </div>
      </div>

      {/* Expanded Support & Custom Tool Requests */}
      <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" /> Request a Custom Tool or Report an Issue
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Need a specific text converter, developer tool, or image manipulator that isn't currently available in our suite of {tools.length} utilities? We actively build and launch new utilities based on user suggestions!
        </p>

        <div className="grid sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/60">
            <div className="font-bold text-foreground mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary" /> Feature Requests
            </div>
            <div className="text-muted-foreground">Describe your ideal tool, input controls, and desired outputs via WhatsApp or email.</div>
          </div>
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/60">
            <div className="font-bold text-foreground mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Bug Reports
            </div>
            <div className="text-muted-foreground">Encountered an unexpected calculation result or formatting error? Send us the details to fix.</div>
          </div>
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/60">
            <div className="font-bold text-foreground mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-500" /> Partnerships
            </div>
            <div className="text-muted-foreground">Interested in sponsoring tools or advertising opportunities on Toolzaro? Drop us a line!</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <Seo 
      title="Privacy Policy – 100% Local Processing, GDPR & AdSense Disclosures | Toolzaro" 
      description="Read Toolzaro’s transparent Privacy Policy covering 100% client-side browser data processing, zero cloud file retention, cookies, Google AdSense, GDPR, and CCPA compliance."
      keywords={['Toolzaro privacy policy', 'client-side privacy', 'GDPR compliance', 'Google AdSense cookie policy']}
      url="https://toolzaro.cyou/privacy-policy"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Privacy Policy | Toolzaro',
        url: 'https://toolzaro.cyou/privacy-policy'
      }}
    />
    
    <PageHeader 
      title="Privacy Policy" 
      subtitle="Transparency and user data sovereignty are fundamental to Toolzaro. Read how we protect your privacy."
      date="October 2026"
    />

    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" /> 1. Client-Side Local Data Processing Guarantee
        </h2>
        <p>
          The vast majority of tools on Toolzaro run 100% locally inside your web browser. Any text, images, files, or custom settings you enter or upload into our utilities are processed using standard JavaScript in your browser’s temporary memory (RAM). <strong>We do not upload, transmit, store, or monitor your personal input files, code snippets, or generated output.</strong>
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> 2. Browser Local Storage (<code className="font-mono text-xs">localStorage</code>)
        </h2>
        <p>
          Toolzaro uses your browser’s standard <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">localStorage</code> solely to remember your user interface preferences:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Theme Setting:</strong> Saving your preference for Light Mode or Dark Mode.</li>
          <li><strong>Bookmarked Tools:</strong> Keeping track of tools you have starred or saved for quick access.</li>
          <li><strong>Scratchpad Notes:</strong> Preserving notes you write locally on your device across sessions.</li>
        </ul>
        <p>This data remains stored locally on your specific device and is never sent to any external server.</p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> 3. Third-Party Advertising & Cookies (Google AdSense & DoubleClick DART)
        </h2>
        <p>
          To maintain Toolzaro as a completely free, unrestricted resource for developers, students, and creators worldwide, we display advertisements served by <strong>Google AdSense</strong> and its advertising partners.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Third-Party Vendors & Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to Toolzaro or other websites on the internet.</li>
          <li><strong>DoubleClick DART Cookie:</strong> Google’s use of advertising cookies (including the DART cookie) enables it and its partner networks to serve targeted or contextual advertisements to our users based on their visits to our site and other destinations across the web.</li>
          <li><strong>Opt-Out Options:</strong> Users may opt out of personalized advertising by visiting the official <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Google Ads Settings</a>. Alternatively, users can opt out of third-party vendor cookies by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">www.aboutads.info</a> or the <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Network Advertising Initiative</a>.</li>
        </ul>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> 4. GDPR (General Data Protection Regulation) & CCPA Compliance
        </h2>
        <p>
          Because Toolzaro does not collect, harvest, store, or sell personal identifiable information (PII) or user account credentials, European Union (GDPR) and California Consumer Privacy Act (CCPA) privacy obligations are inherently respected by our zero-server storage architecture:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Right to Access & Rectification:</strong> Since we hold no database of your identity, clearing your browser cache completely resets all local state.</li>
          <li><strong>Right to Erasure (Right to be Forgotten):</strong> You retain total control over your local data. Simply clearing site data in your browser removes all stored local preferences immediately.</li>
          <li><strong>Zero Sale of Personal Data:</strong> We do not sell, rent, or trade user data to third parties under any circumstances.</li>
        </ul>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" /> 5. Children's Online Privacy Protection Act (COPPA)
        </h2>
        <p>
          Toolzaro is directed at developers, students, and general audiences. We do not knowingly collect personal information from children under the age of 13.
        </p>
      </section>
    </div>
  </div>
);

export const TermsOfService: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <Seo 
      title="Terms of Service – Fair Use & Licensing | Toolzaro" 
      description="Review the official Terms of Service and fair use guidelines for accessing Toolzaro’s free online developer, PDF, image, and converter utilities."
      keywords={['Toolzaro terms of service', 'terms and conditions', 'online tools license']}
      url="https://toolzaro.cyou/terms"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Terms of Service | Toolzaro',
        url: 'https://toolzaro.cyou/terms'
      }}
    />
    
    <PageHeader 
      title="Terms of Service" 
      subtitle="By accessing Toolzaro, you agree to comply with the following fair use terms."
      date="October 2026"
    />

    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" /> 1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using Toolzaro ("Platform", "Website"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any portion of these terms, your sole remedy is to discontinue using the platform.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" /> 2. Permitted Use & Code of Conduct
        </h2>
        <p>
          Toolzaro grants you a non-exclusive, revocable, personal license to utilize all utilities free of charge for personal, educational, and commercial purposes. You agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use any tool to generate malicious code, spam, deceptive phishing payloads, or unlawful content.</li>
          <li>Attempt to reverse engineer, interfere with, or disrupt the integrity and availability of the platform.</li>
          <li>Deploy automated scrapers, bots, or excessive Denial-of-Service (DoS) network floods against our infrastructure.</li>
        </ul>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" /> 3. Disclaimer of Warranties & Limitation of Liability
        </h2>
        <p>
          All tools, mathematical formulas, converters, and generators are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. While our engineering team strives for mathematical precision, Toolzaro makes no express or implied warranties regarding calculation infallibility, uninterrupted uptime, or fitness for a particular commercial purpose.
        </p>
        <p>
          Under no circumstances shall Toolzaro or its contributors be held liable for any direct, indirect, consequential, or incidental damages resulting from the use or inability to use our platform or reliance on generated output.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" /> 4. Intellectual Property
        </h2>
        <p>
          The Toolzaro brand, trademarks, custom UI component layouts, and editorial documentation are protected by copyright and intellectual property laws. Content or files you process using our utilities remain 100% your own property.
        </p>
      </section>
    </div>
  </div>
);

export const Disclaimer: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <Seo 
      title="Disclaimer – Calculation Accuracy & Verification Notice | Toolzaro" 
      description="Official legal and technical disclaimer regarding mathematical accuracy, cryptographic outputs, and third-party links on Toolzaro."
      keywords={['Toolzaro disclaimer', 'accuracy notice', 'legal disclaimer']}
      url="https://toolzaro.cyou/disclaimer"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Disclaimer | Toolzaro',
        url: 'https://toolzaro.cyou/disclaimer'
      }}
    />
    
    <PageHeader 
      title="Disclaimer" 
      subtitle="Important disclosures regarding calculation accuracy, liability, and professional verification."
      date="October 2026"
    />

    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> 1. Accuracy & General Information Notice
        </h2>
        <p>
          The tools, converters, and calculators provided on Toolzaro are designed for general utility and informational purposes only. While our engineering team validates algorithms against standard reference tables, we cannot guarantee 100% mathematical infallibility across all potential edge cases or legacy browser environments.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-500" /> 2. Professional, Medical, & Legal Verification
        </h2>
        <p>
          Outputs generated by our tools (such as cryptographic hash calculations, encryption keys, WCAG accessibility scores, loan amortizations, or BMI metrics) should be independently verified before being relied upon for critical production, medical, engineering, architectural, or legal decisions.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-500" /> 3. External Links & Advertisements
        </h2>
        <p>
          Toolzaro may contain links to third-party websites or advertisements served by Google AdSense and affiliate networks. We do not control or endorse the privacy practices, content, or products found on third-party external sites.
        </p>
      </section>
    </div>

    <AdSlot slot="static-disclaimer-bottom" format="auto" />
  </div>
);

export const HtmlSitemap: React.FC = () => (
  <div className="max-w-6xl mx-auto space-y-10">
    <Seo
      title={`Complete HTML Sitemap – All ${tools.length}+ Tools, Categories & Guides | Toolzaro`}
      description={`Browse the complete HTML Sitemap of Toolzaro featuring direct root-level links to all ${tools.length}+ online tools, ${categories.length} categories, technical guides, and core pages.`}
      keywords={['Toolzaro sitemap', 'all online tools list', 'html sitemap', 'developer tools directory']}
      url="https://toolzaro.cyou/sitemap"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Toolzaro Complete HTML Sitemap',
        url: 'https://toolzaro.cyou/sitemap',
        description: `Complete index of ${tools.length}+ browser utilities, categories, and guides on Toolzaro.`
      }}
    />

    <PageHeader
      title="Complete Site Directory & HTML Sitemap"
      subtitle={`Direct index of all ${tools.length} browser utilities, ${categories.length} categories, engineering articles, and XML sitemaps for fast navigation and search engine discovery.`}
      date="October 2026"
    />

    {/* Core Pages & XML Sitemap Feeds */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-2xs">
        <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" /> Core Platform Pages
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
          <li><Link to="/" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Home Page</Link></li>
          <li><Link to="/bookmarks" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Saved Bookmarks (/bookmarks)</Link></li>
          <li><Link to="/tools" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> All Tools Directory Hub</Link></li>
          <li><Link to="/blog" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Engineering Blog &amp; Guides</Link></li>
          <li><Link to="/about" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> About Toolzaro</Link></li>
          <li><Link to="/contact" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Contact Support</Link></li>
          <li><Link to="/privacy-policy" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Privacy Policy</Link></li>
          <li><Link to="/terms" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Terms of Service</Link></li>
          <li><Link to="/disclaimer" className="text-primary hover:underline flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Disclaimer</Link></li>
        </ul>
      </section>

      <section className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-2xs">
        <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" /> Official Search Console XML Sitemaps &amp; Feeds
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Machine-readable XML sitemaps and feeds automatically generated for Google Search Console, Bing Webmaster Tools, and AI crawlers:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono font-bold">
          <li><a href="/sitemap-index.xml" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">/sitemap-index.xml (Master Index)</a></li>
          <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">/sitemap.xml (All 184+ URLs)</a></li>
          <li><a href="/sitemap-tools.xml" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">/sitemap-tools.xml ({tools.length} Tools)</a></li>
          <li><a href="/sitemap-categories.xml" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">/sitemap-categories.xml ({categories.length} Cats)</a></li>
          <li><a href="/sitemap-pages.xml" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">/sitemap-pages.xml (Core Pages)</a></li>
          <li><a href="/sitemap-blog.xml" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">/sitemap-blog.xml (Blog Guides)</a></li>
          <li><a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">/rss.xml (RSS 2.0 Feed)</a></li>
          <li><a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">/llms.txt (AI Search Index)</a></li>
        </ul>
      </section>
    </div>

    {/* All Tools Grouped by Category */}
    <div className="space-y-8">
      <h2 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2.5">
        <Layers className="w-6 h-6 text-primary" /> All {tools.length} Online Tools by Category (Flat Root-Level URLs)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(categoryName => {
          const catTools = tools.filter(t => t.category === categoryName);
          const catSlug = categoryName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
          return (
            <div key={categoryName} className="bg-card border border-border/80 rounded-3xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <Link to={getCategoryUrl(catSlug)} className="font-display font-bold text-base text-foreground hover:text-primary transition-colors">
                  {categoryName} Tools
                </Link>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {catTools.length}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs">
                {catTools.map(tool => (
                  <li key={tool.slug}>
                    <Link
                      to={getToolUrl(tool.slug)}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-between gap-2 py-0.5"
                    >
                      <span className="font-medium text-foreground/90 hover:text-primary truncate">{tool.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">/{tool.slug}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>

    {/* Published Technical Blog Guides */}
    <section className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-2xs">
      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" /> Engineering Guides &amp; Articles
      </h2>
      <ul className="space-y-2 text-xs">
        {BUILTIN_BLOG_POSTS.map(post => (
          <li key={post.slug}>
            <Link to={getBlogPostUrl(post.slug)} className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{post.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  </div>
);
