import React, { useState, useEffect } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';
// @ts-ignore
import md5 from 'js-md5';

// 1. JSON Formatter
export const JsonFormatter: React.FC = () => {
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
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON');
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Input JSON</label>
        <textarea
          className="w-full min-h-[150px] p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'{"example": "json"}'}
        />
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
      </ToolPanel>
      <OutputBox value={output} label="Formatted JSON" />
    </div>
  );
};

// 2. URL Encoder/Decoder
export const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }
    try {
      if (mode === 'encode') setOutput(encodeURIComponent(input));
      else setOutput(decodeURIComponent(input));
    } catch (e) {
      setOutput('Error: Invalid Input');
    }
  }, [input, mode]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex gap-4 mb-4">
          <button onClick={() => setMode('encode')} className={`flex-1 py-2 rounded-md ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Encode</button>
          <button onClick={() => setMode('decode')} className={`flex-1 py-2 rounded-md ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Decode</button>
        </div>
        <textarea className="w-full min-h-[120px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input text..." />
      </ToolPanel>
      <OutputBox value={output} label="Output" />
    </div>
  );
};

// 3. HTML Entity Encoder
export const HtmlEntityEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (mode === 'encode') {
      setOutput(input.replace(/[\u00A0-\u9999<>\&]/g, (i) => '&#'+i.charCodeAt(0)+';'));
    } else {
      setOutput(input.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)));
    }
  }, [input, mode]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex gap-4 mb-4">
          <button onClick={() => setMode('encode')} className={`flex-1 py-2 rounded-md ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Encode</button>
          <button onClick={() => setMode('decode')} className={`flex-1 py-2 rounded-md ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Decode</button>
        </div>
        <textarea className="w-full min-h-[120px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input text..." />
      </ToolPanel>
      <OutputBox value={output} label="Output" />
    </div>
  );
};

// 4. MD5 Hash Generator
export const Md5Generator: React.FC = () => {
  const [input, setInput] = useState('');
  
  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Input Text</label>
        <textarea className="w-full min-h-[120px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Text to hash..." />
      </ToolPanel>
      <OutputBox value={input ? (md5 as any)(input) : ''} label="MD5 Hash" />
    </div>
  );
};

// 5. JWT Decoder
export const JwtDecoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }
    try {
      const parts = input.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      setOutput(JSON.stringify({ header, payload }, null, 2));
    } catch (e: any) {
      setOutput('Error: ' + e.message);
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">JWT Token</label>
        <textarea className="w-full min-h-[120px] p-3 rounded-md border-input border bg-transparent font-mono break-all" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ey..." />
      </ToolPanel>
      <OutputBox value={output} label="Decoded Header & Payload" />
    </div>
  );
};

// 6. UUID Generator
export const UuidGenerator: React.FC = () => {
  const [count, setCount] = useState(1);
  const [output, setOutput] = useState('');

  const generate = () => {
    const uuids = [];
    for(let i = 0; i < count; i++){
      if (window.crypto && crypto.randomUUID) {
        uuids.push(crypto.randomUUID());
      } else {
        uuids.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        }));
      }
    }
    setOutput(uuids.join('\n'));
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Number of UUIDs</label>
            <input type="number" min="1" max="100" className="w-full p-2 rounded-md border-input border bg-transparent" value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} />
          </div>
          <button onClick={generate} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Regenerate</button>
        </div>
      </ToolPanel>
      <OutputBox value={output} label="Generated UUIDs (v4)" />
    </div>
  );
};

// 7. Lorem Ipsum Generator
export const LoremIpsumGenerator: React.FC = () => {
  const [paragraphs, setParagraphs] = useState(3);
  const [output, setOutput] = useState('');

  const generate = () => {
    const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    const out = [];
    for(let i=0; i < paragraphs; i++){
      out.push(text);
    }
    setOutput(out.join('\n\n'));
  };

  useEffect(() => { generate(); }, [paragraphs]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Paragraphs:</label>
          <input type="number" min="1" max="50" className="w-24 p-2 rounded-md border-input border bg-transparent" value={paragraphs} onChange={(e) => setParagraphs(parseInt(e.target.value) || 1)} />
        </div>
      </ToolPanel>
      <OutputBox value={output} label="Lorem Ipsum" />
    </div>
  );
};

// 8. Unix Timestamp Converter
export const UnixTimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [output, setOutput] = useState('');

  useEffect(() => {
    const ts = parseInt(timestamp);
    if (!isNaN(ts)) {
      setOutput(new Date(ts * 1000).toLocaleString());
    } else {
      setOutput('Invalid Timestamp');
    }
  }, [timestamp]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Unix Timestamp (Seconds)</label>
        <div className="flex gap-4">
          <input type="text" className="flex-1 p-2 rounded-md border-input border bg-transparent font-mono" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
          <button onClick={() => setTimestamp(Math.floor(Date.now() / 1000).toString())} className="px-4 py-2 bg-secondary rounded-md">Now</button>
        </div>
      </ToolPanel>
      <OutputBox value={output} label="Local Time" />
    </div>
  );
};

// 9. CSS Minifier
export const CssMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if(!input) {
       setOutput(''); 
       return;
    }
    const minified = input.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([\{\}\:\;\,])\s*/g, '$1').trim();
    setOutput(minified);
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Input CSS</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md border-input border bg-transparent font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder=".class { color: red; }" />
      </ToolPanel>
      <OutputBox value={output} label="Minified CSS" />
    </div>
  );
};

// 10. Color Converter
export const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState('#000000');
  const [rgb, setRgb] = useState('rgb(0, 0, 0)');

  const hexToRgb = (h: string) => {
    let r = 0, g = 0, b = 0;
    if (h.length === 4) {
      r = parseInt(h[1] + h[1], 16);
      g = parseInt(h[2] + h[2], 16);
      b = parseInt(h[3] + h[3], 16);
    } else if (h.length === 7) {
      r = parseInt(h.substring(1, 3), 16);
      g = parseInt(h.substring(3, 5), 16);
      b = parseInt(h.substring(5, 7), 16);
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHex(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      setRgb(hexToRgb(val));
    }
  };

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">HEX Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={/^#([0-9A-F]{6})$/i.test(hex) ? hex : '#000000'} onChange={(e) => { setHex(e.target.value); setRgb(hexToRgb(e.target.value)); }} className="h-10 w-10 cursor-pointer rounded bg-transparent" />
              <input type="text" className="flex-1 p-2 rounded-md border-input border bg-transparent font-mono" value={hex} onChange={handleHexChange} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RGB Output</label>
            <input type="text" readOnly className="w-full p-2 rounded-md border-input border bg-transparent font-mono opacity-80" value={rgb} />
          </div>
        </div>
      </ToolPanel>
    </div>
  );
};
