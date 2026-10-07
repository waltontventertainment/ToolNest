import React, { useState, useEffect } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';

// 11. IPv6 Generator
export const Ipv6Generator: React.FC = () => {
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');

  const generate = () => {
    const ips = [];
    for (let i = 0; i < count; i++) {
      const parts = Array.from({ length: 8 }, () => Math.floor(Math.random() * 65536).toString(16));
      ips.push(parts.join(':'));
    }
    setOutput(ips.join('\n'));
  };

  useEffect(() => { generate(); }, [count]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Number of IPv6 Addresses</label>
            <input type="number" min="1" max="100" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={count} onChange={e => setCount(parseInt(e.target.value) || 1)} />
          </div>
          <button onClick={generate} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Regenerate</button>
        </div>
      </ToolPanel>
      <OutputBox value={output} label="IPv6 Addresses" />
    </div>
  );
};

// 12. HTTP Status Codes
export const HttpStatusCodes: React.FC = () => {
  const [search, setSearch] = useState('');
  
  const codes = [
    { code: 100, name: 'Continue', type: 'Informational' }, { code: 101, name: 'Switching Protocols', type: 'Informational' },
    { code: 200, name: 'OK', type: 'Success' }, { code: 201, name: 'Created', type: 'Success' }, { code: 204, name: 'No Content', type: 'Success' }, { code: 206, name: 'Partial Content', type: 'Success' },
    { code: 301, name: 'Moved Permanently', type: 'Redirection' }, { code: 302, name: 'Found', type: 'Redirection' }, { code: 304, name: 'Not Modified', type: 'Redirection' }, { code: 307, name: 'Temporary Redirect', type: 'Redirection' }, { code: 308, name: 'Permanent Redirect', type: 'Redirection' },
    { code: 400, name: 'Bad Request', type: 'Client Error' }, { code: 401, name: 'Unauthorized', type: 'Client Error' }, { code: 403, name: 'Forbidden', type: 'Client Error' }, { code: 404, name: 'Not Found', type: 'Client Error' }, { code: 405, name: 'Method Not Allowed', type: 'Client Error' }, { code: 408, name: 'Request Timeout', type: 'Client Error' }, { code: 409, name: 'Conflict', type: 'Client Error' }, { code: 422, name: 'Unprocessable Entity', type: 'Client Error' }, { code: 429, name: 'Too Many Requests', type: 'Client Error' },
    { code: 500, name: 'Internal Server Error', type: 'Server Error' }, { code: 502, name: 'Bad Gateway', type: 'Server Error' }, { code: 503, name: 'Service Unavailable', type: 'Server Error' }, { code: 504, name: 'Gateway Timeout', type: 'Server Error' }
  ];

  const filtered = codes.filter(c => c.code.toString().includes(search) || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <ToolPanel>
        <input type="text" className="w-full p-3 rounded-md bg-transparent border-input border" placeholder="Search code or description (e.g. 404, Not Found)..." value={search} onChange={e => setSearch(e.target.value)} />
      </ToolPanel>
      <div className="bg-zinc-950 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-sm uppercase text-muted-foreground">
            <tr><th className="p-4 w-24">Code</th><th className="p-4">Name</th><th className="p-4">Category</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm font-medium">
            {filtered.map(c => (
              <tr key={c.code} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-primary font-mono text-lg">{c.code}</td>
                <td className="p-4">{c.name}</td>
                <td className="p-4 text-muted-foreground">{c.type}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No matching HTTP status codes found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 13. Text to Morse
export const TextToMorse: React.FC = () => {
  const [input, setInput] = useState('HELLO WORLD');
  const [output, setOutput] = useState('');

  const morseMap: Record<string, string> = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/'
  };

  useEffect(() => {
    const morse = input.toUpperCase().split('').map(c => morseMap[c] || c).join(' ');
    setOutput(morse);
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Text String</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md bg-transparent border-input border font-mono uppercase custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} placeholder="Text here..." />
      </ToolPanel>
      <OutputBox value={output} label="Morse Code Output" />
    </div>
  );
};

// 14. Morse to Text
export const MorseToText: React.FC = () => {
  const [input, setInput] = useState('.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
  const [output, setOutput] = useState('');

  const morseMap: Record<string, string> = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z',
    '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9', '/': ' '
  };

  useEffect(() => {
    const text = input.trim().split(/\s+/).map(c => morseMap[c] || c).join('');
    setOutput(text);
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Morse Code String (use / for spaces)</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} placeholder="Morse here (use / for spaces)..." />
      </ToolPanel>
      <OutputBox value={output} label="Text Output" />
    </div>
  );
};

// 15. Random String Generator
export const RandomStringGenerator: React.FC = () => {
  const [len, setLen] = useState(16);
  const [chars, setChars] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()');
  const [output, setOutput] = useState('');

  const generate = () => {
    let res = '';
    if (chars.length === 0) { setOutput(''); return; }
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOutput(res);
  };

  useEffect(() => { generate(); }, [len, chars]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Length</label>
            <input type="number" min="1" max="2048" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={len} onChange={e => setLen(parseInt(e.target.value) || 16)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Allowed Characters</label>
            <input type="text" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={chars} onChange={e => setChars(e.target.value)} />
          </div>
        </div>
        <button onClick={generate} className="w-full py-2 bg-primary text-primary-foreground rounded-md">Regenerate Random String</button>
      </ToolPanel>
      <OutputBox value={output} label="Random String" />
    </div>
  );
};

// 16. Device Resolution Lookup
export const DeviceResolutionLookup: React.FC = () => {
  const [search, setSearch] = useState('');
  
  const devices = [
    { name: 'iPhone 15 Pro Max', res: '430 x 932', ratio: '19.5:9' },
    { name: 'iPhone 15 Pro', res: '393 x 852', ratio: '19.5:9' },
    { name: 'iPhone SE (3rd gen)', res: '375 x 667', ratio: '16:9' },
    { name: 'iPad Pro 12.9"', res: '1024 x 1366', ratio: '4:3' },
    { name: 'Samsung Galaxy S24 Ultra', res: '412 x 915', ratio: '19.5:9' },
    { name: 'Google Pixel 8 Pro', res: '412 x 892', ratio: '20:9' },
    { name: 'MacBook Air M2', res: '1280 x 832', ratio: '16:10' },
    { name: '1080p Desktop', res: '1920 x 1080', ratio: '16:9' },
    { name: '1440p Desktop', res: '2560 x 1440', ratio: '16:9' },
    { name: '4K Desktop', res: '3840 x 2160', ratio: '16:9' }
  ];

  const filtered = devices.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.res.includes(search));

  return (
    <div className="space-y-6">
      <ToolPanel>
        <input type="text" className="w-full p-3 rounded-md bg-transparent border-input border" placeholder="Search device or resolution..." value={search} onChange={e => setSearch(e.target.value)} />
      </ToolPanel>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(d => (
          <div key={d.name} className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="font-semibold text-lg">{d.name}</div>
            <div className="text-primary font-mono text-xl my-2">{d.res} <span className="text-xs text-muted-foreground ml-1">pts</span></div>
            <div className="text-sm text-muted-foreground">Aspect Ratio: {d.ratio}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 17. Password Strength Checker
export const PasswordStrengthChecker: React.FC = () => {
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    let s = 0;
    if (input.length >= 8) s += 1;
    if (input.length >= 12) s += 1;
    if (/[A-Z]/.test(input)) s += 1;
    if (/[a-z]/.test(input)) s += 1;
    if (/[0-9]/.test(input)) s += 1;
    if (/[^A-Za-z0-9]/.test(input)) s += 1;
    setScore(Math.min(s, 5));
    if (input.length === 0) setScore(0);
  }, [input]);

  const getLabel = () => {
    if (input.length === 0) return 'Enter a password';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Moderate';
    return 'Strong';
  };

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Enter Password</label>
        <input type="text" className="w-full p-3 rounded-md bg-transparent border-input border font-mono" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a password to test..." />
        <div className="mt-6 flex gap-2 h-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${score >= i ? (score <= 2 ? 'bg-red-500' : score <= 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-white/10'}`} />
          ))}
        </div>
        <div className="mt-3 text-sm font-medium text-center">
          Strength: <span className={score <= 2 && input ? 'text-red-400' : score <= 4 && input ? 'text-yellow-400' : score === 5 ? 'text-green-400' : 'text-muted-foreground'}>{getLabel()}</span>
        </div>
      </ToolPanel>
    </div>
  );
};

// 18. Text to Decimal
export const TextToDecimal: React.FC = () => {
  const [input, setInput] = useState('hello');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const enc = new TextEncoder();
    setOutput(Array.from(enc.encode(input)).map(b => b.toString(10)).join(' '));
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Text Input</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} placeholder="Text..." />
      </ToolPanel>
      <OutputBox value={output} label="Decimal Values" />
    </div>
  );
};

// 19. Decimal to Text
export const DecimalToText: React.FC = () => {
  const [input, setInput] = useState('104 101 108 108 111');
  const [output, setOutput] = useState('');

  useEffect(() => {
    try {
      const arr = input.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
      setOutput(new TextDecoder().decode(new Uint8Array(arr)));
    } catch { setOutput('Invalid input'); }
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Decimal Input (space-separated)</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} placeholder="104 101..." />
      </ToolPanel>
      <OutputBox value={output} label="Text Output" />
    </div>
  );
};

// 20. JS Minifier (Basic Regex)
export const BasicJsMinifier: React.FC = () => {
  const [input, setInput] = useState('function test() {\n  console.log("hello");\n}');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) { setOutput(''); return; }
    let min = input;
    min = min.replace(/\/\*[\s\S]*?\*\//g, ''); // remove block comments
    min = min.replace(/\/\/.*/g, ''); // remove line comments
    min = min.replace(/\s+/g, ' '); // collapse spaces
    min = min.replace(/\s*([\{\}\(\)\;\:\,\=\+\-\*\/])\s*/g, '$1'); // remove space around operators
    setOutput(min.trim());
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">JS Code (Basic Regex Minification)</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md bg-transparent border-input border font-mono text-xs custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} />
      </ToolPanel>
      <OutputBox value={output} label="Minified Output" />
    </div>
  );
};
