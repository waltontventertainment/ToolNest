import React, { useState } from 'react';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { 
  Mail, MessageSquare, ShieldCheck, FileText, Info, Sparkles, 
  Lock, Scale, AlertTriangle, CheckCircle2, Globe, Wrench, Send, Copy, Check,
  Zap, Cpu, UserCheck, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { tools, categories } from '../lib/registry';

const PageHeader = ({ title, subtitle, date }: { title: string; subtitle?: string; date?: string }) => (
  <div className="mb-10 text-center md:text-left border-b border-border/60 pb-6">
    <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight mb-3 text-foreground">{title}</h1>
    {subtitle && <p className="text-base text-muted-foreground max-w-2xl">{subtitle}</p>}
    {date && <p className="text-xs text-muted-foreground/80 mt-2 font-mono">Effective Date: {date}</p>}
  </div>
);

export const About: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-12">
    <Seo title="About Us | ToolNest" description={`Learn more about ToolNest - a free, privacy-first suite of ${tools.length} client-side web tools.`} />
    
    <PageHeader 
      title="About ToolNest" 
      subtitle={`Building the ultimate browser-native toolbox with ${tools.length} live utilities for developers, designers, and creators.`}
    />

    <div className="grid md:grid-cols-3 gap-6">
      <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-base mb-2">100% Private & Secure</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your files, text inputs, and photos never leave your computer. Everything processes locally inside your browser memory.
        </p>
      </div>

      <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-base mb-2">Zero Registration</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          No signups, no subscriptions, and no paywalls. Open any tool and complete your tasks immediately without barriers.
        </p>
      </div>

      <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-4">
          <Wrench className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-base mb-2">{tools.length} Live Utilities</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          From image converters and color extractors to JSON formatters and hash generators—all seamlessly updated automatically.
        </p>
      </div>
    </div>

    {/* Comprehensive Architecture & Philosophy */}
    <section className="bg-card border border-border/80 rounded-3xl p-8 space-y-6">
      <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
        <Cpu className="w-6 h-6 text-primary" /> Architecture & Client-Side Engine
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Traditional web utility sites require users to upload confidential data, source code, photos, or password strings to remote cloud servers. This introduces bandwidth delay, server downtime, and privacy security risks.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        <strong>ToolNest is engineered around a client-first architecture.</strong> By harnessing standard modern browser APIs—including HTML5 Canvas API, Web Cryptography SubtleCrypto API, CSS Color Module Level 4 algorithms, and JavaScript ES2024 state engines—<strong>all computation occurs 100% on your local CPU and GPU.</strong>
      </p>

      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Zero Cloud File Retention</div>
            <div className="text-xs text-muted-foreground">Uploaded images or confidential snippets never touch a backend server.</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Instant Processing Speed</div>
            <div className="text-xs text-muted-foreground">Zero network latency; operations process at hardware execution speed.</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Automatic Dynamic Expansion</div>
            <div className="text-xs text-muted-foreground">Currently hosting {tools.length} tools across {categories.length} categories, automatically syncing updates.</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Offline Capabilities</div>
            <div className="text-xs text-muted-foreground">Once loaded in your browser session, tools run without active internet.</div>
          </div>
        </div>
      </div>
    </section>

    {/* Tool Categories Overview */}
    <section className="bg-card border border-border/80 rounded-3xl p-8 space-y-6">
      <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
        <Zap className="w-6 h-6 text-amber-500" /> Tool Categories & Capabilities
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        ToolNest organizes its {tools.length} utilities into intuitive categories designed for everyday workflow efficiency:
      </p>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const categoryTools = tools.filter(t => t.category === cat);
          return (
            <div key={cat} className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{cat}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {categoryTools.length} {categoryTools.length === 1 ? 'Tool' : 'Tools'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {categoryTools.slice(0, 4).map(t => t.name).join(', ')}
                {categoryTools.length > 4 ? `, and ${categoryTools.length - 4} more.` : '.'}
              </p>
            </div>
          );
        })}
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
      <Seo title="Contact Us | ToolNest" description="Get in touch with the ToolNest team via Gmail or WhatsApp for support, feedback, and custom tool requests." />
      
      <PageHeader 
        title="Contact Us" 
        subtitle="Have feedback, bug reports, feature requests, or custom tool suggestions? Connect directly with our team!"
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
              <h3 className="text-xl font-bold text-foreground mt-2">Gmail Inquiry</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                For detailed technical queries, bug reports, and commercial inquiries. Guaranteed response within 12 to 24 hours.
              </p>
            </div>
            
            <div className="p-3.5 bg-secondary/80 rounded-2xl font-mono text-xs font-bold text-foreground break-all border border-border/80 flex items-center justify-between gap-2 shadow-2xs">
              <span className="text-primary font-bold">{email}</span>
              <button 
                onClick={copyEmail}
                className="p-1.5 rounded-xl bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-border"
                title="Copy Email"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <a 
            href={`mailto:${email}`}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xs"
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
                Instant WhatsApp Chat
              </span>
              <h3 className="text-xl font-bold text-foreground mt-2">WhatsApp Support</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Chat directly with our development team on WhatsApp for fast feedback, urgent bug reports, or quick tool suggestions.
              </p>
            </div>

            {/* High-contrast WhatsApp Phone Badge for Light & Dark Mode */}
            <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/90 rounded-2xl font-mono text-sm font-extrabold text-emerald-950 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between shadow-2xs">
              <span className="tracking-wide">{whatsappNumber}</span>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                Active Support
              </span>
            </div>
          </div>

          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp Directly</span>
          </a>
        </div>
      </div>

      {/* Expanded Support & Custom Tool Requests */}
      <section className="bg-card border border-border/80 rounded-3xl p-8 space-y-6">
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
            <div className="text-muted-foreground">Interested in sponsoring tools or advertising opportunities on ToolNest? Drop us a line!</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <Seo title="Privacy Policy | ToolNest" description="Detailed privacy policy for ToolNest regarding browser storage, analytics, and advertising." />
    
    <PageHeader 
      title="Privacy Policy" 
      subtitle="Transparency is core to ToolNest. Read how we protect your information."
      date="August 2026"
    />

    <div className="bg-card border border-border/80 rounded-3xl p-8 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" /> 1. Client-Side Local Data Processing
        </h2>
        <p>
          The vast majority of tools on ToolNest run 100% locally inside your web browser. Any text, images, files, or custom settings you enter or upload into our utilities are processed using standard JavaScript in your browser’s temporary memory. <strong>We do not upload, transmit, store, or monitor your personal input files or generated output.</strong>
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> 2. Local Storage Usage
        </h2>
        <p>
          ToolNest uses your browser’s standard <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">localStorage</code> solely to remember your user interface preferences:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Theme Setting:</strong> Saving your preference for Light Mode or Dark Mode.</li>
          <li><strong>Bookmarked Tools:</strong> Keeping track of tools you have starred or saved for quick access.</li>
        </ul>
        <p>This data remains stored locally on your specific device and is never sent to any external server.</p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> 3. Third-Party Advertising & Cookies (Google AdSense)
        </h2>
        <p>
          To maintain ToolNest as a completely free resource for everyone, we display third-party advertisements served by Google AdSense and its partners.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites on the internet.</li>
          <li>Google’s use of advertising cookies enables it and its partners to serve personalized or contextual advertisements to you based on your web browsing history.</li>
        </ul>
        <p>
          You may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">AboutAds.info</a>.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> 4. GDPR & CCPA Compliance
        </h2>
        <p>
          Because we do not store, harvest, or sell personal identifiers or user database accounts, European Union (GDPR) and California (CCPA) data deletion obligations are inherently met by our zero-server storage architecture. Clearing your browser cookies and site data completely resets all local preferences.
        </p>
      </section>
    </div>
  </div>
);

export const TermsOfService: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <Seo title="Terms of Service | ToolNest" description="Terms and conditions for accessing and using ToolNest tools." />
    
    <PageHeader 
      title="Terms of Service" 
      subtitle="By accessing ToolNest, you agree to comply with the following terms."
      date="August 2026"
    />

    <div className="bg-card border border-border/80 rounded-3xl p-8 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" /> 1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using ToolNest ("Website"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our platform.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" /> 2. Permitted Use & Conduct
        </h2>
        <p>
          ToolNest provides browser utilities free of charge for personal, educational, and commercial purposes. You agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use any tool to generate malicious code, spam, deceptive phishing content, or unlawful media.</li>
          <li>Attempt to compromise the integrity or security of the website or interfere with other users' access.</li>
          <li>Automate excessive scraping or DOS attacks against our platform infrastructure.</li>
        </ul>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" /> 3. Limitation of Liability
        </h2>
        <p>
          All tools are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind. ToolNest shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our tools or reliance on calculated output.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" /> 4. Modifications to Service
        </h2>
        <p>
          We reserve the right to update, modify, or discontinue any tool or feature at any time without prior notice.
        </p>
      </section>
    </div>
  </div>
);

export const Disclaimer: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <Seo title="Disclaimer | ToolNest" description="Official disclaimer regarding accuracy and utility output on ToolNest." />
    
    <PageHeader 
      title="Disclaimer" 
      subtitle="Important notes regarding accuracy, liability, and professional verification."
    />

    <div className="bg-card border border-border/80 rounded-3xl p-8 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> 1. Accuracy & General Information Notice
        </h2>
        <p>
          The tools, converters, and calculators provided on ToolNest are designed for general utility and informational purposes only. While we test and strive for mathematical precision in our converters, unit formulas, and graphic generators, we cannot guarantee 100% flawlessness in all potential edge cases or browser environments.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-500" /> 2. Professional & Legal Verification
        </h2>
        <p>
          Outputs generated by our tools (such as hash calculations, encryption keys, WCAG contrast checks, or financial ratios) should be independently verified before being relied upon for critical production, medical, engineering, or legal decisions.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-border/60">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-500" /> 3. External Links & Advertisements
        </h2>
        <p>
          ToolNest may contain links to third-party websites or advertisements served by Google AdSense. We do not control or guarantee the content, privacy practices, or accuracy of third-party external sites.
        </p>
      </section>
    </div>

    <AdSlot slot="static-disclaimer-bottom" format="auto" />
  </div>
);
