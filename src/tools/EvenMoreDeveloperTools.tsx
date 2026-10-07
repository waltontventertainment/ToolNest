import React, { useState, useEffect, useRef } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';

// 1. HTML Editor & Viewer
export const HtmlEditor: React.FC = () => {
  const [html, setHtml] = useState('<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; text-align: center; padding: 2rem; }\n    h1 { color: #3b82f6; }\n  </style>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>Edit the HTML on the left to see changes here.</p>\n</body>\n</html>');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2">HTML Code</label>
          <textarea
            className="flex-1 w-full p-4 rounded-xl bg-zinc-950/50 border-input border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none custom-scrollbar"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck="false"
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2">Live Preview</label>
          <div className="flex-1 bg-white rounded-xl overflow-hidden border border-input">
            <iframe
              title="HTML Preview"
              className="w-full h-full border-none"
              sandbox="allow-scripts"
              srcDoc={html}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Regex Tester
export const RegexTester: React.FC = () => {
  const [regex, setRegex] = useState('[A-Z]\\w+');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('Hello World, this is a Test.');
  const [matches, setMatches] = useState<{ match: string, index: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!regex) {
        setMatches([]);
        setError(null);
        return;
      }
      const re = new RegExp(regex, flags);
      const newMatches = [];
      let match;
      if (flags.includes('g')) {
        while ((match = re.exec(testString)) !== null) {
          newMatches.push({ match: match[0], index: match.index });
          if (match[0].length === 0) re.lastIndex++; // avoid infinite loop on empty match
        }
      } else {
        match = re.exec(testString);
        if (match) newMatches.push({ match: match[0], index: match.index });
      }
      setMatches(newMatches);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setMatches([]);
    }
  }, [regex, flags, testString]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium mb-1">Regular Expression</label>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1 text-lg">/</span>
              <input type="text" className="flex-1 p-2 rounded-md border-input border bg-transparent font-mono" value={regex} onChange={(e) => setRegex(e.target.value)} />
              <span className="text-muted-foreground ml-1 mr-2 text-lg">/</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Flags</label>
            <input type="text" className="w-full p-2 rounded-md border-input border bg-transparent font-mono" value={flags} onChange={(e) => setFlags(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Test String</label>
          <textarea className="w-full min-h-[100px] p-3 rounded-md border-input border bg-transparent font-mono" value={testString} onChange={(e) => setTestString(e.target.value)} />
        </div>
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
      </ToolPanel>
      <OutputBox value={matches.length > 0 ? matches.map((m, i) => `Match ${i + 1}: "${m.match}" (Index: ${m.index})`).join('\n') : 'No matches found.'} label={`Matches (${matches.length})`} />
    </div>
  );
};

// 3. URL Parser
export const UrlParser: React.FC = () => {
  const [url, setUrl] = useState('https://www.example.com:8080/path/to/page?query=string&foo=bar#hash-section');
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!url) {
        setParsed(null);
        setError(null);
        return;
      }
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((val, key) => { params[key] = val; });
      
      setParsed({
        href: urlObj.href,
        protocol: urlObj.protocol,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        params: params
      });
      setError(null);
    } catch (e) {
      setParsed(null);
      setError('Invalid URL');
    }
  }, [url]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">URL to Parse</label>
        <textarea className="w-full p-3 rounded-md border-input border bg-transparent font-mono h-24 resize-none" value={url} onChange={(e) => setUrl(e.target.value)} />
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
      </ToolPanel>
      <OutputBox value={parsed ? JSON.stringify(parsed, null, 2) : ''} label="Parsed URL Object" />
    </div>
  );
};

// 4. SHA Generator
export const ShaGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({ sha1: '', sha256: '', sha384: '', sha512: '' });

  useEffect(() => {
    if (!input) {
      setHashes({ sha1: '', sha256: '', sha384: '', sha512: '' });
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    const generateHash = async (algo: string) => {
      if (!window.crypto || !crypto.subtle) return 'Error: crypto.subtle not available';
      try {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        return 'Error generating hash';
      }
    };

    Promise.all([
      generateHash('SHA-1'),
      generateHash('SHA-256'),
      generateHash('SHA-384'),
      generateHash('SHA-512')
    ]).then(([sha1, sha256, sha384, sha512]) => {
      setHashes({ sha1, sha256, sha384, sha512 });
    });
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Input Text</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
      </ToolPanel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OutputBox value={hashes.sha1} label="SHA-1" />
        <OutputBox value={hashes.sha256} label="SHA-256" />
        <OutputBox value={hashes.sha384} label="SHA-384" />
        <OutputBox value={hashes.sha512} label="SHA-512" />
      </div>
    </div>
  );
};

// 5. JSON Minifier
export const JsonMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) {
      setOutput('');
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Invalid JSON');
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">JSON to Minify</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
      </ToolPanel>
      <OutputBox value={output} label="Minified JSON" />
    </div>
  );
};

// 6. XML Formatter
export const XmlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const formatXml = (xml: string) => {
    let formatted = '';
    let pad = 0;
    xml = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
    xml.split('\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) pad -= 1;
      } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      formatted += '  '.repeat(pad) + node + '\n';
      pad += indent;
    });
    return formatted.trim();
  };

  useEffect(() => {
    if (!input) setOutput('');
    else setOutput(formatXml(input));
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">XML to Format</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
      </ToolPanel>
      <OutputBox value={output} label="Formatted XML" />
    </div>
  );
};

// 7. SQL Minifier
export const SqlMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }
    // Basic SQL minification: remove comments, newlines, extra spaces
    let minified = input.replace(/--.*$/gm, ''); // remove single line comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, ''); // remove multi-line comments
    minified = minified.replace(/\s+/g, ' ').trim(); // remove extra spaces and newlines
    setOutput(minified);
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">SQL to Minify</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
      </ToolPanel>
      <OutputBox value={output} label="Minified SQL" />
    </div>
  );
};

// 8. HTML Minifier
export const HtmlMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }
    let minified = input.replace(/<!--[\s\S]*?-->/g, ''); // remove comments
    minified = minified.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    setOutput(minified);
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">HTML to Minify</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
      </ToolPanel>
      <OutputBox value={output} label="Minified HTML" />
    </div>
  );
};

// 9. Chmod Calculator
export const ChmodCalculator: React.FC = () => {
  const [permissions, setPermissions] = useState({
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    public: { read: true, write: false, execute: true },
  });

  const getOctal = (type: 'owner' | 'group' | 'public') => {
    let val = 0;
    if (permissions[type].read) val += 4;
    if (permissions[type].write) val += 2;
    if (permissions[type].execute) val += 1;
    return val;
  };

  const getSymbolic = (type: 'owner' | 'group' | 'public') => {
    let str = '';
    str += permissions[type].read ? 'r' : '-';
    str += permissions[type].write ? 'w' : '-';
    str += permissions[type].execute ? 'x' : '-';
    return str;
  };

  const toggle = (type: 'owner' | 'group' | 'public', perm: 'read' | 'write' | 'execute') => {
    setPermissions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [perm]: !prev[type][perm]
      }
    }));
  };

  const octal = `${getOctal('owner')}${getOctal('group')}${getOctal('public')}`;
  const symbolic = `-${getSymbolic('owner')}${getSymbolic('group')}${getSymbolic('public')}`;

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          {(['owner', 'group', 'public'] as const).map(type => (
            <div key={type}>
              <h3 className="font-semibold capitalize mb-3">{type}</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={permissions[type].read} onChange={() => toggle(type, 'read')} className="w-4 h-4" />
                  Read (4)
                </label>
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={permissions[type].write} onChange={() => toggle(type, 'write')} className="w-4 h-4" />
                  Write (2)
                </label>
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={permissions[type].execute} onChange={() => toggle(type, 'execute')} className="w-4 h-4" />
                  Execute (1)
                </label>
              </div>
            </div>
          ))}
        </div>
      </ToolPanel>
      <div className="grid grid-cols-2 gap-4">
        <OutputBox value={octal} label="Octal Notation" />
        <OutputBox value={symbolic} label="Symbolic Notation" />
      </div>
    </div>
  );
};

// 10. Text to Slug Converter
export const TextToSlugConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const slug = input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setOutput(slug);
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Text String</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
      </ToolPanel>
      <OutputBox value={output} label="URL Slug" />
    </div>
  );
};
