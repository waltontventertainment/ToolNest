import React, { useState, useEffect } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';

// 1. CSV to JSON
export const CsvToJson: React.FC = () => {
  const [input, setInput] = useState('id,name\n1,Alice\n2,Bob');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) { setOutput(''); setError(null); return; }
    try {
      const lines = input.trim().split('\n');
      if (lines.length === 0) return;
      const headers = lines[0].split(',').map(h => h.trim());
      const result = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = values[i] ? values[i].trim() : ''; });
        return obj;
      });
      setOutput(JSON.stringify(result, null, 2));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">CSV Input</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md bg-transparent border-input border font-mono text-sm custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} placeholder="id,name\n1,John" />
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
      </ToolPanel>
      <OutputBox value={output} label="JSON Output" />
    </div>
  );
};

// 2. JSON to CSV
export const JsonToCsv: React.FC = () => {
  const [input, setInput] = useState('[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) { setOutput(''); setError(null); return; }
    try {
      let parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) parsed = [parsed];
      if (parsed.length === 0) { setOutput(''); return; }
      
      const headers = Object.keys(parsed[0]);
      const csv = [
        headers.join(','),
        ...parsed.map((row: any) => headers.map(h => {
          let val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(','))
      ].join('\n');
      setOutput(csv);
      setError(null);
    } catch (e: any) { setError(e.message); }
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">JSON Input (Array of Objects)</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md bg-transparent border-input border font-mono text-sm custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} />
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
      </ToolPanel>
      <OutputBox value={output} label="CSV Output" />
    </div>
  );
};

// 3. String Escape / Unescape
export const StringEscape: React.FC = () => {
  const [input, setInput] = useState('Hello "World"\nNew Line');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) { setOutput(''); return; }
    try {
      if (mode === 'escape') {
        setOutput(JSON.stringify(input).slice(1, -1));
      } else {
        setOutput(JSON.parse(`"${input}"`));
      }
    } catch (e) { setOutput('Error processing string'); }
  }, [input, mode]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex gap-4 mb-4">
          <button onClick={() => setMode('escape')} className={`flex-1 py-2 rounded-md transition-colors ${mode === 'escape' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Escape</button>
          <button onClick={() => setMode('unescape')} className={`flex-1 py-2 rounded-md transition-colors ${mode === 'unescape' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Unescape</button>
        </div>
        <textarea className="w-full min-h-[120px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} />
      </ToolPanel>
      <OutputBox value={output} label="Output" />
    </div>
  );
};

// 4. HMAC Generator
export const HmacGenerator: React.FC = () => {
  const [input, setInput] = useState('Hello World');
  const [secret, setSecret] = useState('secret_key');
  const [algo, setAlgo] = useState('SHA-256');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input || !secret) { setOutput(''); return; }
    const generate = async () => {
      try {
        if (!window.crypto || !crypto.subtle) return;
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
          'raw', enc.encode(secret), { name: 'HMAC', hash: algo }, false, ['sign']
        );
        const signature = await window.crypto.subtle.sign('HMAC', keyMaterial, enc.encode(input));
        setOutput(Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join(''));
      } catch (e) { setOutput('Error generating HMAC'); }
    };
    generate();
  }, [input, secret, algo]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Secret Key</label>
            <input type="text" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={secret} onChange={e => setSecret(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Algorithm</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={algo} onChange={e => setAlgo(e.target.value)}>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Input Text</label>
          <textarea className="w-full min-h-[100px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} />
        </div>
      </ToolPanel>
      <OutputBox value={output} label="HMAC Hash (Hex)" />
    </div>
  );
};

// 5. IPv4 Subnet Calculator
export const Ipv4SubnetCalc: React.FC = () => {
  const [ip, setIp] = useState('192.168.1.1');
  const [cidr, setCidr] = useState('24');
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    try {
      const parts = ip.split('.').map(Number);
      if (parts.length !== 4 || parts.some(isNaN || (n => n < 0 || n > 255))) throw new Error();
      const mask = parseInt(cidr);
      if (isNaN(mask) || mask < 0 || mask > 32) throw new Error();
      
      const ipInt = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
      const maskInt = mask === 0 ? 0 : (~0 << (32 - mask));
      const netInt = ipInt & maskInt;
      const bcInt = netInt | ~maskInt;
      
      const toIp = (int: number) => [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
      
      setInfo({
        network: toIp(netInt),
        mask: toIp(maskInt),
        broadcast: toIp(bcInt),
        hosts: mask === 32 ? 1 : mask === 31 ? 2 : Math.pow(2, 32 - mask) - 2,
        firstHost: mask >= 31 ? toIp(netInt) : toIp(netInt + 1),
        lastHost: mask >= 31 ? toIp(bcInt) : toIp(bcInt - 1)
      });
    } catch {
      setInfo(null);
    }
  }, [ip, cidr]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">IP Address</label>
            <input type="text" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={ip} onChange={e => setIp(e.target.value)} />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium mb-1">CIDR (/%d)</label>
            <input type="number" min="0" max="32" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={cidr} onChange={e => setCidr(e.target.value)} />
          </div>
        </div>
      </ToolPanel>
      <OutputBox value={info ? `Network Address: ${info.network}\nNetmask: ${info.mask}\nBroadcast Address: ${info.broadcast}\nHost Range: ${info.firstHost} - ${info.lastHost}\nUsable Hosts: ${info.hosts}` : 'Invalid IP or CIDR'} label="Subnet Information" />
    </div>
  );
};

// 6. MIME Type Lookup
export const MimeTypeLookup: React.FC = () => {
  const [ext, setExt] = useState('json');
  const mimes: Record<string, string> = {
    'html': 'text/html', 'css': 'text/css', 'js': 'application/javascript', 'json': 'application/json',
    'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'gif': 'image/gif', 'svg': 'image/svg+xml', 'webp': 'image/webp',
    'txt': 'text/plain', 'xml': 'application/xml', 'pdf': 'application/pdf', 'zip': 'application/zip',
    'mp3': 'audio/mpeg', 'mp4': 'video/mp4', 'csv': 'text/csv', 'woff': 'font/woff', 'woff2': 'font/woff2',
    'md': 'text/markdown', 'ttf': 'font/ttf', 'wav': 'audio/wav', 'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">File Extension (without dot)</label>
        <input type="text" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={ext} onChange={e => setExt(e.target.value.toLowerCase().replace(/^\./, ''))} placeholder="e.g. json" />
      </ToolPanel>
      <OutputBox value={ext ? (mimes[ext] || 'Unknown MIME type or not in local database') : ''} label="MIME Type" />
    </div>
  );
};

// 7. JS Keycode Info
export const JsKeycodeInfo: React.FC = () => {
  const [keyInfo, setKeyInfo] = useState<{ key: string, code: string, keyCode: number, shift: boolean, ctrl: boolean, alt: boolean, meta: boolean } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setKeyInfo({ key: e.key, code: e.code, keyCode: e.keyCode, shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-input rounded-xl text-center min-h-[300px]">
          <p className="text-xl text-muted-foreground mb-8">Press any key on your keyboard</p>
          {keyInfo ? (
            <div className="flex flex-col gap-6 w-full max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10"><div className="text-sm text-muted-foreground mb-2">event.key</div><div className="text-2xl font-mono font-bold text-primary truncate" title={keyInfo.key}>{keyInfo.key === ' ' ? 'Space' : keyInfo.key}</div></div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10"><div className="text-sm text-muted-foreground mb-2">event.keyCode</div><div className="text-4xl font-mono font-bold text-primary">{keyInfo.keyCode}</div></div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10"><div className="text-sm text-muted-foreground mb-2">event.code</div><div className="text-xl font-mono font-bold text-primary truncate" title={keyInfo.code}>{keyInfo.code}</div></div>
              </div>
              <div className="flex justify-center gap-4 text-sm font-mono mt-4">
                <span className={`px-3 py-1 rounded-full border ${keyInfo.shift ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-muted-foreground'}`}>Shift</span>
                <span className={`px-3 py-1 rounded-full border ${keyInfo.ctrl ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-muted-foreground'}`}>Ctrl</span>
                <span className={`px-3 py-1 rounded-full border ${keyInfo.alt ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-muted-foreground'}`}>Alt</span>
                <span className={`px-3 py-1 rounded-full border ${keyInfo.meta ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-muted-foreground'}`}>Meta</span>
              </div>
            </div>
          ) : (
            <div className="text-4xl font-mono font-bold text-primary/20">Waiting...</div>
          )}
        </div>
      </ToolPanel>
    </div>
  );
};

// 8. Query String Parser
export const QueryStringParser: React.FC = () => {
  const [input, setInput] = useState('?user=123&name=john+doe&tags=admin&tags=staff');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) { setOutput(''); return; }
    try {
      const qs = input.startsWith('?') ? input.substring(1) : input;
      const params = new URLSearchParams(qs);
      const result: Record<string, string | string[]> = {};
      params.forEach((val, key) => {
        if (result[key]) {
          if (Array.isArray(result[key])) (result[key] as string[]).push(val);
          else result[key] = [result[key] as string, val];
        } else {
          result[key] = val;
        }
      });
      setOutput(JSON.stringify(result, null, 2));
    } catch { setOutput('Invalid Query String'); }
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Query String (with or without ?)</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} />
      </ToolPanel>
      <OutputBox value={output} label="Parsed JSON object" />
    </div>
  );
};

// 9. MAC Address Generator
export const MacAddressGenerator: React.FC = () => {
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState(':');

  const generate = () => {
    const macs = [];
    for (let i = 0; i < count; i++) {
      const parts = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
      if (format === 'none') {
        macs.push(parts.join('').toUpperCase());
      } else {
        macs.push(parts.join(format).toUpperCase());
      }
    }
    setOutput(macs.join('\n'));
  };

  useEffect(() => { generate(); }, [count, format]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Number of MACs</label>
            <input type="number" min="1" max="100" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={count} onChange={e => setCount(parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={format} onChange={e => setFormat(e.target.value)}>
              <option value=":">Colon (:)</option>
              <option value="-">Hyphen (-)</option>
              <option value="none">No Separator</option>
            </select>
          </div>
        </div>
        <button onClick={generate} className="w-full py-2 bg-primary text-primary-foreground rounded-md">Regenerate</button>
      </ToolPanel>
      <OutputBox value={output} label="MAC Addresses" />
    </div>
  );
};

// 10. IPv4 Generator
export const Ipv4Generator: React.FC = () => {
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');

  const generate = () => {
    const ips = [];
    for (let i = 0; i < count; i++) {
      ips.push(`${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}`);
    }
    setOutput(ips.join('\n'));
  };

  useEffect(() => { generate(); }, [count]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Number of IP Addresses</label>
            <input type="number" min="1" max="100" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={count} onChange={e => setCount(parseInt(e.target.value) || 1)} />
          </div>
          <button onClick={generate} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Regenerate</button>
        </div>
      </ToolPanel>
      <OutputBox value={output} label="IPv4 Addresses" />
    </div>
  );
};
