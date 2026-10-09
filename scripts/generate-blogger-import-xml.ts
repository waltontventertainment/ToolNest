import fs from 'fs';
import path from 'path';
import { tools } from '../src/lib/registry';
import { BUILTIN_BLOG_POSTS } from '../src/lib/blogData';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtmlForXml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function simpleMarkdownToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const result: string[] = [];
  let inList = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (line.startsWith('# ')) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(`<h1 style="font-size:24px; font-weight:800; color:#0f172a; margin:24px 0 12px;">${line.replace('# ', '')}</h1>`);
    } else if (line.startsWith('## ')) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(`<h2 style="font-size:20px; font-weight:700; color:#1e293b; margin:20px 0 10px;">${line.replace('## ', '')}</h2>`);
    } else if (line.startsWith('### ')) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(`<h3 style="font-size:17px; font-weight:600; color:#334155; margin:16px 0 8px;">${line.replace('### ', '')}</h3>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        result.push('<ul style="padding-left:20px; line-height:1.7; color:#334155; margin:12px 0;">');
        inList = true;
      }
      const item = line.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      result.push(`<li>${item}</li>`);
    } else if (line.startsWith('---')) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push('<hr style="border:0; border-top:1px solid #e2e8f0; margin:28px 0;" />');
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
      result.push(`<p style="font-size:15px; line-height:1.7; color:#334155; margin:10px 0;">${formatted}</p>`);
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

export interface StaticPageData {
  title: string;
  slug: string;
  contentHtml: string;
}

export function getStaticPagesData(): StaticPageData[] {
  return [
    {
      title: 'About Toolzaro',
      slug: 'about',
      contentHtml: `
<div class="toolzaro-static-page about-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="padding: 28px; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.06)); border: 1px solid rgba(139,92,246,0.25); border-radius: 16px; margin-bottom: 30px;">
    <h1 style="font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">About Toolzaro</h1>
    <p style="font-size: 16px; color: #475569; margin: 0;">Building the ultimate browser-native toolbox with ${tools.length} live utilities for developers, designers, students, and creators worldwide.</p>
  </div>

  <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 28px;">100% Client-Side Privacy &amp; Security</h2>
  <p>Conventional web utility sites routinely require users to transmit confidential files, source code, photos, or password strings to remote cloud servers. This introduces network delays, server queue latency, and grave privacy vulnerabilities.</p>
  <p><strong>Toolzaro is engineered around a strict client-first paradigm.</strong> By harnessing standard modern browser APIs—including the HTML5 Canvas API, Web Cryptography SubtleCrypto API, WebAssembly (WASM), and JavaScript ES2024 engines—<strong>all computation occurs 100% locally on your device's CPU and memory.</strong></p>

  <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 28px;">Key Principles</h2>
  <ul style="padding-left: 20px; line-height: 1.8;">
    <li><strong>Zero Registration Barrier:</strong> No accounts, no subscriptions, no credit cards required.</li>
    <li><strong>Zero Cloud File Retention:</strong> Uploaded images or documents never leave your browser window.</li>
    <li><strong>Instant Hardware Acceleration:</strong> Zero network latency; operations process at native device speed.</li>
    <li><strong>Comprehensive Coverage:</strong> ${tools.length} production utilities across Developer Tools, Image Studios, PDF Workflows, Converters, and Cryptographic Generators.</li>
  </ul>

  <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 28px;">Editorial &amp; Engineering Standards</h2>
  <p>Toolzaro is maintained by a dedicated team of software engineers, technical SEO consultants, and systems architects. Every utility undergoes automated and manual verification against official IEEE, W3C, ISO, and NIST specifications.</p>
</div>
`
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      contentHtml: `
<div class="toolzaro-static-page contact-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="padding: 28px; background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.06)); border: 1px solid rgba(16,185,129,0.25); border-radius: 16px; margin-bottom: 30px;">
    <h1 style="font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">Contact Us</h1>
    <p style="font-size: 16px; color: #475569; margin: 0;">Have feedback, bug reports, feature requests, or custom tool suggestions? Connect directly with the Toolzaro engineering desk.</p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px;">
    <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">📧 Email Inquiry</h3>
      <p style="font-size: 14px; color: #64748b; margin: 0 0 16px 0;">For technical queries, bug reports, partnership proposals, and commercial inquiries.</p>
      <p style="font-family: monospace; font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0;">sabbirhasansh321@gmail.com</p>
      <a href="mailto:sabbirhasansh321@gmail.com" style="display: inline-block; padding: 10px 18px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px;">Send Email</a>
    </div>

    <div style="padding: 24px; border: 1px solid #a7f3d0; border-radius: 14px; background: #f0fdf4; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="font-size: 18px; font-weight: 700; color: #065f46; margin: 0 0 8px 0;">💬 WhatsApp Instant Support</h3>
      <p style="font-size: 14px; color: #047857; margin: 0 0 16px 0;">Chat directly with our development desk on WhatsApp for rapid feedback or tool suggestions.</p>
      <p style="font-family: monospace; font-size: 16px; font-weight: 800; color: #065f46; margin: 0 0 12px 0;">+8801908567684</p>
      <a href="https://wa.me/8801908567684" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px;">Chat on WhatsApp</a>
    </div>
  </div>

  <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 28px;">Custom Tool Requests</h2>
  <p>Need a specialized text formatter, developer tool, or calculation utility that is not yet among our ${tools.length} tools? Drop us an email or message on WhatsApp and our team will build and deploy it!</p>
</div>
`
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      contentHtml: `
<div class="toolzaro-static-page privacy-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="padding: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 30px;">
    <h1 style="font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">Privacy Policy</h1>
    <p style="font-size: 14px; color: #64748b; margin: 0;">Last Updated: October 2026 | Transparency and user data sovereignty are fundamental to Toolzaro.</p>
  </div>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">1. Client-Side Local Data Processing Guarantee</h2>
  <p>The vast majority of tools on Toolzaro execute 100% locally inside your web browser. Any text, images, files, or custom settings you enter or upload are processed using standard client-side JavaScript in your browser's temporary memory (RAM). <strong>We do not upload, transmit, store, or monitor your personal input files, code snippets, or generated output.</strong></p>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">2. Browser Local Storage (localStorage)</h2>
  <p>Toolzaro uses your browser's standard <code>localStorage</code> solely to remember user interface preferences: theme mode (light/dark), bookmarked tools, and local scratchpad notes. This data remains stored locally on your specific device and is never sent to any external server.</p>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">3. Third-Party Advertising &amp; Cookies (Google AdSense &amp; DoubleClick DART)</h2>
  <p>To maintain Toolzaro as a completely free, unrestricted resource for developers, students, and creators worldwide, we display advertisements served by <strong>Google AdSense</strong> and its advertising partners.</p>
  <ul style="padding-left: 20px; line-height: 1.8;">
    <li><strong>Third-Party Vendors &amp; Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to Toolzaro or other websites on the internet.</li>
    <li><strong>DoubleClick DART Cookie:</strong> Google's use of advertising cookies (including the DART cookie) enables it and its partner networks to serve targeted or contextual advertisements to our users based on their visits to our site and other destinations across the web.</li>
    <li><strong>Opt-Out Options:</strong> Users may opt out of personalized advertising by visiting the official <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. Alternatively, users can opt out of third-party vendor cookies by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</li>
  </ul>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">4. GDPR &amp; CCPA Compliance</h2>
  <p>Because Toolzaro does not collect, harvest, store, or sell personal identifiable information (PII) or user account credentials, European Union (GDPR) and California Consumer Privacy Act (CCPA) privacy obligations are inherently respected by our zero-server storage architecture.</p>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">5. Children's Online Privacy (COPPA)</h2>
  <p>Toolzaro is directed at developers, students, and general audiences. We do not knowingly collect personal information from children under the age of 13.</p>
</div>
`
    },
    {
      title: 'Terms of Service',
      slug: 'terms',
      contentHtml: `
<div class="toolzaro-static-page terms-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="padding: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 30px;">
    <h1 style="font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">Terms of Service</h1>
    <p style="font-size: 14px; color: #64748b; margin: 0;">Last Updated: October 2026 | Fair use policies for accessing Toolzaro online utilities.</p>
  </div>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">1. Acceptance of Terms</h2>
  <p>By accessing or using Toolzaro ("Platform", "Website"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any portion of these terms, your sole remedy is to discontinue using the platform.</p>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">2. Permitted Use &amp; Code of Conduct</h2>
  <p>Toolzaro grants you a non-exclusive, revocable, personal license to utilize all utilities free of charge for personal, educational, and commercial purposes. You agree not to:</p>
  <ul style="padding-left: 20px; line-height: 1.8;">
    <li>Use any tool to generate malicious code, spam, deceptive phishing payloads, or unlawful content.</li>
    <li>Attempt to reverse engineer, interfere with, or disrupt the integrity and availability of the platform.</li>
    <li>Deploy automated scrapers, bots, or excessive Denial-of-Service (DoS) floods against our infrastructure.</li>
  </ul>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">3. Disclaimer of Warranties &amp; Limitation of Liability</h2>
  <p>All tools, mathematical formulas, converters, and generators are provided on an "AS IS" and "AS AVAILABLE" basis. Under no circumstances shall Toolzaro or its contributors be held liable for any direct, indirect, consequential, or incidental damages resulting from the use or inability to use our platform or reliance on generated output.</p>
</div>
`
    },
    {
      title: 'Disclaimer',
      slug: 'disclaimer',
      contentHtml: `
<div class="toolzaro-static-page disclaimer-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="padding: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 30px;">
    <h1 style="font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">Disclaimer</h1>
    <p style="font-size: 14px; color: #64748b; margin: 0;">Last Updated: October 2026 | Disclosures regarding calculation accuracy and verification.</p>
  </div>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">1. Accuracy &amp; General Information Notice</h2>
  <p>The tools, converters, and calculators provided on Toolzaro are designed for general utility and informational purposes only. While our engineering team validates algorithms against standard reference tables, we cannot guarantee 100% mathematical infallibility across all potential edge cases or legacy browser environments.</p>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">2. Professional, Medical, &amp; Legal Verification</h2>
  <p>Outputs generated by our tools (such as cryptographic hash calculations, encryption keys, WCAG accessibility scores, loan amortizations, or BMI metrics) should be independently verified before being relied upon for critical production, medical, engineering, architectural, or legal decisions.</p>

  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 24px;">3. External Links &amp; Advertisements</h2>
  <p>Toolzaro may contain links to third-party websites or advertisements served by Google AdSense. We do not control or endorse the privacy practices, content, or products found on third-party external sites.</p>
</div>
`
    }
  ];
}

export function generateBloggerImportFeed(options: {
  includeTools?: boolean;
  includePages?: boolean;
  includeBlog?: boolean;
  targetDomain?: string;
} = {}): string {
  const {
    includeTools = true,
    includePages = true,
    includeBlog = true,
    targetDomain = 'toolzaro.blogspot.com'
  } = options;

  const now = new Date('2026-10-01T00:00:00.000Z');
  const nowIso = now.toISOString();

  let entriesXml = '';
  let counter = 1000;

  // 1. TOOLS (kind#post)
  if (includeTools) {
    tools.forEach((tool, index) => {
      counter++;
      const postDate = new Date(now.getTime() - (tools.length - index) * 60000);
      const dateIso = postDate.toISOString();
      const postId = counter;
      const permalink = `https://${targetDomain}/2026/10/${tool.slug}.html`;

      const howToSteps = tool.howTo && tool.howTo.length > 0 
        ? tool.howTo 
        : ['Enter or paste your content in the input field.', 'Adjust tool options and parameters.', 'Instantly preview, copy, or download your results.'];

      const faqs = tool.faq && tool.faq.length > 0 
        ? tool.faq 
        : [
            { q: `Is ${tool.name} free to use?`, a: `Yes, ${tool.name} is completely free without limits or registrations.` },
            { q: `Is my data private?`, a: `Yes, all processing takes place entirely in your browser memory. Nothing is uploaded to remote servers.` }
          ];

      const innerHtml = `
<div class="toolzaro-tool-post" data-tool-slug="${escapeXml(tool.slug)}">
  <div class="toolzaro-hero-section" style="padding: 24px; background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.06)); border: 1px solid rgba(139,92,246,0.25); border-radius: 12px; margin-bottom: 28px;">
    <span style="display: inline-block; padding: 4px 10px; background: rgba(139,92,246,0.2); color: #a78bfa; font-size: 12px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">${escapeXml(tool.category)}</span>
    <h1 style="font-size: 26px; font-weight: 800; color: #f8fafc; margin: 0 0 10px 0;">${escapeXml(tool.name)}</h1>
    <p style="font-size: 15px; color: #94a3b8; line-height: 1.6; margin: 0;">${escapeXml(tool.intro || tool.metaDescription || `High-performance online utility for ${tool.name}. Fast, secure, and private.`)}</p>
  </div>

  <div id="interactive-tool-hook" class="tool-app-canvas" style="min-height: 320px; margin-bottom: 32px;">
    <!-- Interactive React Tool Canvas Hydrated Instantly by Toolzaro Theme Engine -->
  </div>

  <div class="toolzaro-knowledge-section" style="margin-top: 36px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.08);">
    <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 14px;">How to Use ${escapeXml(tool.name)}</h2>
    <ol style="padding-left: 20px; color: #cbd5e1; line-height: 1.8; margin-bottom: 28px;">
      ${howToSteps.map(step => `<li>${escapeXml(step)}</li>`).join('')}
    </ol>

    <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 14px;">Key Capabilities &amp; Features</h2>
    <ul style="padding-left: 20px; color: #cbd5e1; line-height: 1.8; margin-bottom: 28px;">
      <li><strong>100% Client-Side Privacy:</strong> Zero cloud leaks. Your data stays in your browser memory.</li>
      <li><strong>Blazing Fast Execution:</strong> Real-time processing with zero latency.</li>
      <li><strong>Responsive &amp; Mobile-Ready:</strong> Works on desktop, tablet, and mobile devices.</li>
      <li><strong>Free &amp; Unlimited:</strong> No account, no API keys, and no subscriptions required.</li>
    </ul>

    <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 14px;">Frequently Asked Questions</h2>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${faqs.map(faq => `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px;">
          <h3 style="font-size: 15px; font-weight: 600; color: #e2e8f0; margin: 0 0 6px 0;">${escapeXml(faq.q)}</h3>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0;">${escapeXml(faq.a)}</p>
        </div>
      `).join('')}
    </div>
  </div>
</div>
`.trim();

      entriesXml += `
  <entry>
    <id>tag:blogger.com,1999:blog-toolzaro.post-${postId}</id>
    <published>${dateIso}</published>
    <updated>${dateIso}</updated>
    <category scheme='http://schemas.google.com/g/data#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
    <category scheme='http://www.blogger.com/atom/ns#' term='${escapeXml(tool.category)}'/>
    <title type='text'>${escapeXml(tool.name)}</title>
    <content type='html'>${escapeHtmlForXml(innerHtml)}</content>
    <link rel='replies' type='application/atom+xml' href='https://${targetDomain}/feeds/post-${postId}/comments/default' title='Post Comments'/>
    <link rel='replies' type='text/html' href='https://${targetDomain}/feeds/post-${postId}/comments/default' title='0 Comments'/>
    <link rel='edit' type='application/atom+xml' href='https://www.blogger.com/feeds/default/posts/default/post-${postId}'/>
    <link rel='self' type='application/atom+xml' href='https://www.blogger.com/feeds/default/posts/default/post-${postId}'/>
    <link rel='alternate' type='text/html' href='${permalink}' title='${escapeXml(tool.name)}'/>
    <author>
      <name>Toolzaro</name>
      <uri>https://${targetDomain}</uri>
      <email>noreply@blogger.com</email>
      <gd:image src='https://ui-avatars.com/api/?name=Toolzaro&amp;background=8b5cf6&amp;color=ffffff&amp;bold=true&amp;size=160&amp;rounded=true' width='160' height='160'/>
    </author>
  </entry>`;
    });
  }

  // 2. BLOG GUIDES & ARTICLES (kind#post)
  if (includeBlog) {
    BUILTIN_BLOG_POSTS.forEach((blogPost, index) => {
      counter++;
      const postDate = new Date(now.getTime() - (1000 - index) * 60000);
      const dateIso = postDate.toISOString();
      const postId = counter;
      const permalink = `https://${targetDomain}/2026/10/${blogPost.slug}.html`;

      const bodyHtml = simpleMarkdownToHtml(blogPost.content);
      const innerHtml = `
<article class="toolzaro-blog-article" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
    <span style="display:inline-block; padding: 4px 10px; background: #e0e7ff; color: #4338ca; font-size: 12px; font-weight: 700; border-radius: 9999px; text-transform: uppercase;">${escapeXml(blogPost.category)}</span>
    <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 12px 0;">${escapeXml(blogPost.title)}</h1>
    <p style="font-size: 15px; color: #64748b; line-height: 1.6;">${escapeXml(blogPost.excerpt)}</p>
    <div style="display: flex; gap: 16px; font-size: 13px; color: #94a3b8; margin-top: 14px;">
      <span>By <strong>${escapeXml(blogPost.author?.name || 'Toolzaro Team')}</strong></span>
      <span>•</span>
      <span>${blogPost.readTimeMinutes} min read</span>
    </div>
  </div>

  ${blogPost.coverImage ? `<div style="margin: 24px 0;"><img src="${escapeXml(blogPost.coverImage)}" alt="${escapeXml(blogPost.title)}" style="width: 100%; max-height: 440px; object-fit: cover; border-radius: 12px;" /></div>` : ''}

  <div class="blog-body" style="font-size: 16px; line-height: 1.8; color: #334155;">
    ${bodyHtml}
  </div>
</article>
`.trim();

      entriesXml += `
  <entry>
    <id>tag:blogger.com,1999:blog-toolzaro.post-${postId}</id>
    <published>${dateIso}</published>
    <updated>${dateIso}</updated>
    <category scheme='http://schemas.google.com/g/data#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
    <category scheme='http://www.blogger.com/atom/ns#' term='${escapeXml(blogPost.category)}'/>
    <title type='text'>${escapeXml(blogPost.title)}</title>
    <content type='html'>${escapeHtmlForXml(innerHtml)}</content>
    <link rel='replies' type='application/atom+xml' href='https://${targetDomain}/feeds/post-${postId}/comments/default' title='Post Comments'/>
    <link rel='replies' type='text/html' href='https://${targetDomain}/feeds/post-${postId}/comments/default' title='0 Comments'/>
    <link rel='edit' type='application/atom+xml' href='https://www.blogger.com/feeds/default/posts/default/post-${postId}'/>
    <link rel='self' type='application/atom+xml' href='https://www.blogger.com/feeds/default/posts/default/post-${postId}'/>
    <link rel='alternate' type='text/html' href='${permalink}' title='${escapeXml(blogPost.title)}'/>
    <author>
      <name>${escapeXml(blogPost.author?.name || 'Toolzaro Editorial Team')}</name>
      <uri>https://${targetDomain}</uri>
      <email>noreply@blogger.com</email>
    </author>
  </entry>`;
    });
  }

  // 3. OFFICIAL STATIC PAGES (kind#page)
  if (includePages) {
    const staticPages = getStaticPagesData();
    staticPages.forEach((page, index) => {
      counter++;
      const pageDate = new Date(now.getTime() - (2000 - index) * 60000);
      const dateIso = pageDate.toISOString();
      const pageId = counter;
      const permalink = `https://${targetDomain}/p/${page.slug}.html`;

      entriesXml += `
  <entry>
    <id>tag:blogger.com,1999:blog-toolzaro.page-${pageId}</id>
    <published>${dateIso}</published>
    <updated>${dateIso}</updated>
    <category scheme='http://schemas.google.com/g/data#kind' term='http://schemas.google.com/blogger/2008/kind#page'/>
    <title type='text'>${escapeXml(page.title)}</title>
    <content type='html'>${escapeHtmlForXml(page.contentHtml.trim())}</content>
    <link rel='edit' type='application/atom+xml' href='https://www.blogger.com/feeds/default/pages/default/page-${pageId}'/>
    <link rel='self' type='application/atom+xml' href='https://www.blogger.com/feeds/default/pages/default/page-${pageId}'/>
    <link rel='alternate' type='text/html' href='${permalink}' title='${escapeXml(page.title)}'/>
    <author>
      <name>Toolzaro Team</name>
      <uri>https://${targetDomain}</uri>
      <email>noreply@blogger.com</email>
    </author>
  </entry>`;
    });
  }

  return `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' 
      xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/' 
      xmlns:blogger='http://schemas.google.com/blogger/2008' 
      xmlns:georss='http://www.georss.org/georss' 
      xmlns:gd='http://schemas.google.com/g/data' 
      xmlns:thr='http://purl.org/syndication/thread/1.0'>
  <id>tag:blogger.com,1999:blog-toolzaro</id>
  <updated>${nowIso}</updated>
  <title type='text'>Toolzaro Web Collection</title>
  <subtitle type='text'>Official importable collection for Blogger</subtitle>
  <link rel='http://schemas.google.com/g/data#resumable-create-media' type='application/atom+xml' href='https://www.blogger.com/feeds/default/posts/default'/>
  <link rel='self' type='application/atom+xml' href='https://www.blogger.com/feeds/default/posts/default'/>
  <author>
    <name>Toolzaro Team</name>
    <uri>https://${targetDomain}</uri>
    <email>noreply@blogger.com</email>
  </author>
  <generator version='7.00' uri='http://www.blogger.com'>Blogger</generator>
${entriesXml}
</feed>
`;
}

// If executed directly via tsx
const isDirectRun = process.argv[1]?.endsWith('generate-blogger-import-xml.ts');
if (isDirectRun) {
  const outDir = path.resolve('blogger-deploy');
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Full Master Bundle (All tools + All Blog Guides + All Static Pages)
  const fullXml = generateBloggerImportFeed({ includeTools: true, includeBlog: true, includePages: true });
  fs.writeFileSync(path.join(outDir, 'blogger-import-all.xml'), fullXml, 'utf-8');

  // 2. Tools only
  const toolsXml = generateBloggerImportFeed({ includeTools: true, includeBlog: false, includePages: false });
  fs.writeFileSync(path.join(outDir, 'blogger-import-tools.xml'), toolsXml, 'utf-8');

  // 3. Static Pages only (About, Contact, Privacy, Terms, Disclaimer)
  const pagesXml = generateBloggerImportFeed({ includeTools: false, includeBlog: false, includePages: true });
  fs.writeFileSync(path.join(outDir, 'blogger-import-pages.xml'), pagesXml, 'utf-8');

  // 4. Blog Guides only
  const blogXml = generateBloggerImportFeed({ includeTools: false, includeBlog: true, includePages: false });
  fs.writeFileSync(path.join(outDir, 'blogger-import-blog.xml'), blogXml, 'utf-8');

  console.log(`✅ Successfully generated Blogger Import XML files:`);
  console.log(` 1. blogger-deploy/blogger-import-all.xml   (FULL WEBSITE: 156 Tools + 5 Blog Guides + 5 Static Pages = 166 entries)`);
  console.log(` 2. blogger-deploy/blogger-import-tools.xml (156 Tools as official posts)`);
  console.log(` 3. blogger-deploy/blogger-import-pages.xml (5 Static Pages: About, Contact, Privacy, Terms, Disclaimer)`);
  console.log(` 4. blogger-deploy/blogger-import-blog.xml  (5 Blog articles & technical guides)`);
}
