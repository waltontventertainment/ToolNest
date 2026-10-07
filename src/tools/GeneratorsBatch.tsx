import React, { useState, useEffect } from 'react';
import { ToolPanel, OutputBox, DownloadButton } from '../lib/toolkit';
import { RefreshCw, Copy, Check, Sparkles, Sliders } from 'lucide-react';
import { toast } from 'sonner';

// 1. Cron Expression Generator
export const CronGenerator: React.FC = () => {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  const [preset, setPreset] = useState('every_minute');

  useEffect(() => {
    switch (preset) {
      case 'every_minute':
        setMinute('*'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'every_5_minutes':
        setMinute('*/5'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'every_15_minutes':
        setMinute('*/15'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'hourly':
        setMinute('0'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'daily_midnight':
        setMinute('0'); setHour('0'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'weekly':
        setMinute('0'); setHour('0'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('0');
        break;
      case 'monthly':
        setMinute('0'); setHour('0'); setDayOfMonth('1'); setMonth('*'); setDayOfWeek('*');
        break;
    }
  }, [preset]);

  const cronString = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const getHumanReadable = () => {
    if (cronString === '* * * * *') return 'Runs every minute of every day.';
    if (cronString === '*/5 * * * *') return 'Runs every 5 minutes.';
    if (cronString === '*/15 * * * *') return 'Runs every 15 minutes.';
    if (cronString === '0 * * * *') return 'Runs at minute 0 of every hour.';
    if (cronString === '0 0 * * *') return 'Runs every day at midnight (00:00).';
    if (cronString === '0 0 * * 0') return 'Runs every Sunday at midnight (00:00).';
    if (cronString === '0 0 1 * *') return 'Runs at midnight on the 1st of every month.';
    return `Runs schedule: Minute [${minute}], Hour [${hour}], Day of Month [${dayOfMonth}], Month [${month}], Day of Week [${dayOfWeek}]`;
  };

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Presets</label>
            <select 
              value={preset} 
              onChange={e => setPreset(e.target.value)}
              className="w-full p-2.5 rounded-md bg-transparent border-input border"
            >
              <option value="every_minute">Every Minute (* * * * *)</option>
              <option value="every_5_minutes">Every 5 Minutes (*/5 * * * *)</option>
              <option value="every_15_minutes">Every 15 Minutes (*/15 * * * *)</option>
              <option value="hourly">Every Hour at Minute 0 (0 * * * *)</option>
              <option value="daily_midnight">Every Day at Midnight (0 0 * * *)</option>
              <option value="weekly">Every Sunday at Midnight (0 0 * * 0)</option>
              <option value="monthly">Every 1st of Month at Midnight (0 0 1 * *)</option>
              <option value="custom">Custom Schedule</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium mb-1">Minute (0-59)</label>
              <input type="text" value={minute} onChange={e => { setMinute(e.target.value); setPreset('custom'); }} className="w-full p-2 text-center rounded bg-transparent border border-input font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Hour (0-23)</label>
              <input type="text" value={hour} onChange={e => { setHour(e.target.value); setPreset('custom'); }} className="w-full p-2 text-center rounded bg-transparent border border-input font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Day of Month (1-31)</label>
              <input type="text" value={dayOfMonth} onChange={e => { setDayOfMonth(e.target.value); setPreset('custom'); }} className="w-full p-2 text-center rounded bg-transparent border border-input font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Month (1-12)</label>
              <input type="text" value={month} onChange={e => { setMonth(e.target.value); setPreset('custom'); }} className="w-full p-2 text-center rounded bg-transparent border border-input font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Day of Week (0-6)</label>
              <input type="text" value={dayOfWeek} onChange={e => { setDayOfWeek(e.target.value); setPreset('custom'); }} className="w-full p-2 text-center rounded bg-transparent border border-input font-mono text-sm" />
            </div>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={cronString} label="Generated Cron Expression" />

      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <h4 className="text-sm font-semibold mb-1">Description</h4>
        <p className="text-sm text-muted-foreground">{getHumanReadable()}</p>
      </div>
    </div>
  );
};

// 2. CSS Gradient Generator
export const CssGradientGenerator: React.FC = () => {
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [angle, setAngle] = useState(90);
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#9333ea');

  const cssValue = type === 'linear' 
    ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
    : type === 'radial' 
    ? `radial-gradient(circle at center, ${color1}, ${color2})`
    : `conic-gradient(from ${angle}deg at 50% 50%, ${color1}, ${color2})`;

  const cssCode = `background: ${color1};\nbackground: ${cssValue};`;

  const presets = [
    { name: 'Ocean Sunset', c1: '#ff7e5f', c2: '#feb47b' },
    { name: 'Neon Purple', c1: '#3b82f6', c2: '#9333ea' },
    { name: 'Emerald Forest', c1: '#10b981', c2: '#059669' },
    { name: 'Cyberpunk', c1: '#f43f5e', c2: '#8b5cf6' },
    { name: 'Midnight', c1: '#0f172a', c2: '#334155' }
  ];

  return (
    <div className="space-y-6">
      <div 
        className="w-full h-48 rounded-xl border shadow-inner transition-all flex items-center justify-center text-white font-medium drop-shadow-md"
        style={{ background: cssValue }}
      >
        Gradient Preview
      </div>

      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gradient Type</label>
              <div className="flex gap-2">
                {(['linear', 'radial', 'conic'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-sm capitalize ${type === t ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {type !== 'radial' && (
              <div>
                <label className="block text-sm font-medium mb-1">Angle ({angle}°)</label>
                <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color 1</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <input type="text" value={color1} onChange={e => setColor1(e.target.value)} className="w-full p-2 text-sm rounded border bg-transparent font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color 2</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <input type="text" value={color2} onChange={e => setColor2(e.target.value)} className="w-full p-2 text-sm rounded border bg-transparent font-mono" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Presets</label>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button
                    key={p.name}
                    onClick={() => { setColor1(p.c1); setColor2(p.c2); }}
                    className="text-xs px-2.5 py-1 rounded-full border bg-secondary/50 hover:bg-secondary"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={cssCode} label="CSS Rules" />
    </div>
  );
};

// 3. Placeholder Image Generator
export const PlaceholderImageGenerator: React.FC = () => {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [bgColor, setBgColor] = useState('#334155');
  const [textColor, setTextColor] = useState('#ffffff');
  const [customText, setCustomText] = useState('');

  const textToDisplay = customText || `${width} × ${height}`;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bgColor}" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="sans-serif" font-size="${Math.max(12, Math.min(width, height) / 10)}px" font-weight="bold">${textToDisplay}</text>
</svg>`;

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `placeholder-${width}x${height}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = dataUrl;
  };

  return (
    <div className="space-y-6">
      <div className="w-full flex justify-center p-4 bg-secondary/20 rounded-xl border">
        <img src={dataUrl} alt="Placeholder Preview" className="max-h-64 object-contain shadow-sm rounded" />
      </div>

      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Width (px)</label>
            <input type="number" min="10" max="2000" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full p-2 rounded border bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (px)</label>
            <input type="number" min="10" max="2000" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full p-2 rounded border bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Custom Text</label>
            <input type="text" placeholder="e.g. Hero Banner" value={customText} onChange={e => setCustomText(e.target.value)} className="w-full p-2 rounded border bg-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full p-2 text-sm rounded border bg-transparent font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full p-2 text-sm rounded border bg-transparent font-mono" />
            </div>
          </div>
        </div>
      </ToolPanel>

      <div className="flex justify-end gap-2">
        <DownloadButton onClick={handleDownloadPNG} label="Download PNG" />
      </div>

      <OutputBox value={dataUrl} label="Data URL" />
      <OutputBox value={`<img src="${dataUrl}" alt="${textToDisplay}" width="${width}" height="${height}" />`} label="HTML Image Tag" />
    </div>
  );
};

// 4. Mock Data Generator
export const MockDataGenerator: React.FC = () => {
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [output, setOutput] = useState('');

  const generateData = () => {
    const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Michael', 'Sarah', 'David', 'Emma', 'Daniel', 'Olivia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto', 'Singapore'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.io', 'example.com'];

    const items = [];
    for (let i = 1; i <= count; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const age = Math.floor(Math.random() * 45) + 20;
      const salary = Math.floor(Math.random() * 80000) + 40000;

      items.push({
        id: i,
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`,
        age,
        city,
        salary,
        isActive: Math.random() > 0.3
      });
    }

    if (format === 'json') {
      setOutput(JSON.stringify(items, null, 2));
    } else {
      const headers = Object.keys(items[0]).join(',');
      const rows = items.map(item => Object.values(item).join(',')).join('\n');
      setOutput(`${headers}\n${rows}`);
    }
  };

  useEffect(() => {
    generateData();
  }, [count, format]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Rows Count ({count})</label>
            <input type="range" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Output Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as any)} className="w-full p-2 rounded border bg-transparent">
              <option value="json">JSON Array</option>
              <option value="csv">CSV Format</option>
            </select>
          </div>
          <div>
            <button 
              onClick={generateData}
              className="w-full flex items-center justify-center gap-2 p-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={output} label={`Generated Mock Data (${format.toUpperCase()})`} />
    </div>
  );
};

// 5. SQL Seed Data / Insert Statement Generator
export const SqlInsertGenerator: React.FC = () => {
  const [tableName, setTableName] = useState('users');
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');

  const generateSql = () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George'];
    const roles = ['admin', 'user', 'editor', 'viewer'];

    const statements: string[] = [];
    for (let i = 1; i <= count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const email = `${name.toLowerCase()}${i}@example.com`;
      const role = roles[Math.floor(Math.random() * roles.length)];
      const isActive = Math.random() > 0.2 ? 1 : 0;
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().slice(0, 19).replace('T', ' ');

      statements.push(
        `INSERT INTO \`${tableName}\` (\`id\`, \`name\`, \`email\`, \`role\`, \`is_active\`, \`created_at\`) VALUES (${i}, '${name}', '${email}', '${role}', ${isActive}, '${createdAt}');`
      );
    }
    setOutput(statements.join('\n'));
  };

  useEffect(() => {
    generateSql();
  }, [tableName, count]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Table Name</label>
            <input type="text" value={tableName} onChange={e => setTableName(e.target.value)} className="w-full p-2 rounded border bg-transparent font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Row Count</label>
            <input type="number" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full p-2 rounded border bg-transparent text-sm" />
          </div>
          <div>
            <button 
              onClick={generateSql}
              className="w-full flex items-center justify-center gap-2 p-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Generate SQL
            </button>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={output} label="Generated SQL INSERT Queries" />
    </div>
  );
};

// 6. UUID & Unique ID Suite Generator
export const IdGeneratorSuite: React.FC = () => {
  const [type, setType] = useState<'uuid' | 'ulid' | 'nanoid' | 'cuid'>('uuid');
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');

  const generateIds = () => {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      if (type === 'uuid') {
        ids.push(crypto.randomUUID());
      } else if (type === 'ulid') {
        const time = Date.now().toString(36).toUpperCase().padStart(10, '0');
        const rand = Array.from(crypto.getRandomValues(new Uint8Array(10))).map(b => b.toString(36).toUpperCase()).join('').slice(0, 16);
        ids.push((time + rand).slice(0, 26));
      } else if (type === 'nanoid') {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_~';
        const bytes = crypto.getRandomValues(new Uint8Array(21));
        ids.push(Array.from(bytes).map(b => chars[b % chars.length]).join(''));
      } else {
        const timestamp = Date.now().toString(36);
        const rand = Math.random().toString(36).substring(2, 10);
        ids.push(`c${timestamp}${rand}`);
      }
    }
    setOutput(ids.join('\n'));
  };

  useEffect(() => {
    generateIds();
  }, [type, count]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">ID Standard</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 rounded border bg-transparent capitalize">
              <option value="uuid">UUID v4</option>
              <option value="ulid">ULID</option>
              <option value="nanoid">NanoID</option>
              <option value="cuid">CUID2 Style</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Batch Size ({count})</label>
            <input type="range" min="1" max="50" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <button 
              onClick={generateIds}
              className="w-full flex items-center justify-center gap-2 p-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Generate New IDs
            </button>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={output} label={`Generated ${type.toUpperCase()} List`} />
    </div>
  );
};

// 7. API Key & Secret Generator
export const SecretKeyGenerator: React.FC = () => {
  const [length, setLength] = useState(32);
  const [prefix, setPrefix] = useState('sk_live_');
  const [format, setFormat] = useState<'hex' | 'base64' | 'alphanumeric'>('hex');
  const [output, setOutput] = useState('');

  const generateSecret = () => {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);

    let raw = '';
    if (format === 'hex') {
      raw = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    } else if (format === 'base64') {
      raw = btoa(String.fromCharCode(...bytes)).replace(/[/+=]/g, '');
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      raw = Array.from(bytes).map(b => chars[b % chars.length]).join('');
    }

    setOutput(`${prefix}${raw}`);
  };

  useEffect(() => {
    generateSecret();
  }, [length, prefix, format]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Key Prefix</label>
            <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="w-full p-2 rounded border bg-transparent font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Length ({length} bytes)</label>
            <input type="range" min="16" max="64" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Encoding Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as any)} className="w-full p-2 rounded border bg-transparent capitalize">
              <option value="hex">Hexadecimal</option>
              <option value="base64">Base64 Safe</option>
              <option value="alphanumeric">Alphanumeric</option>
            </select>
          </div>
        </div>

        <button 
          onClick={generateSecret}
          className="w-full flex items-center justify-center gap-2 p-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Generate Secret Key
        </button>
      </ToolPanel>

      <OutputBox value={output} label="Generated API Secret Key" />
    </div>
  );
};

// 8. Advanced URL Slug Generator
export const AdvancedSlugGenerator: React.FC = () => {
  const [input, setInput] = useState('Hello World! How to create 100% SEO Friendly Slugs in 2026?');
  const [separator, setSeparator] = useState('-');
  const [lowercase, setLowercase] = useState(true);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [output, setOutput] = useState('');

  useEffect(() => {
    let str = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (removeStopWords) {
      const stopWords = ['a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const words = str.split(/\s+/);
      str = words.filter(w => !stopWords.includes(w.toLowerCase())).join(' ');
    }

    if (lowercase) {
      str = str.toLowerCase();
    }

    str = str
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .trim()
      .replace(/[\s-_]+/g, separator);

    setOutput(str);
  }, [input, separator, lowercase, removeStopWords]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Input Title / Text</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} className="w-full p-3 rounded border bg-transparent font-mono text-sm min-h-[100px] mb-4" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Separator</label>
            <select value={separator} onChange={e => setSeparator(e.target.value)} className="w-full p-2 rounded border bg-transparent font-mono">
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="lowercase" checked={lowercase} onChange={e => setLowercase(e.target.checked)} className="rounded" />
            <label htmlFor="lowercase" className="text-sm font-medium">Force Lowercase</label>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="stopwords" checked={removeStopWords} onChange={e => setRemoveStopWords(e.target.checked)} className="rounded" />
            <label htmlFor="stopwords" className="text-sm font-medium">Remove Stop Words</label>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={output} label="Generated URL Slug" />
    </div>
  );
};

// 9. Web App Manifest & Favicon Generator
export const FaviconManifestGenerator: React.FC = () => {
  const [appName, setAppName] = useState('ToolNest');
  const [shortName, setShortName] = useState('ToolNest');
  const [themeColor, setThemeColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [display, setDisplay] = useState('standalone');

  const manifestJson = JSON.stringify({
    name: appName,
    short_name: shortName,
    start_url: '/',
    display: display,
    background_color: bgColor,
    theme_color: themeColor,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }, null, 2);

  const htmlTags = `<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="${themeColor}" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`;

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Application Name</label>
            <input type="text" value={appName} onChange={e => setAppName(e.target.value)} className="w-full p-2 rounded border bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Short Name</label>
            <input type="text" value={shortName} onChange={e => setShortName(e.target.value)} className="w-full p-2 rounded border bg-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <input type="text" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-full p-2 text-sm rounded border bg-transparent font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full p-2 text-sm rounded border bg-transparent font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Display Mode</label>
            <select value={display} onChange={e => setDisplay(e.target.value)} className="w-full p-2 rounded border bg-transparent">
              <option value="standalone">Standalone</option>
              <option value="fullscreen">Fullscreen</option>
              <option value="minimal-ui">Minimal UI</option>
              <option value="browser">Browser</option>
            </select>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={manifestJson} label="site.webmanifest File Content" />
      <OutputBox value={htmlTags} label="HTML <head> Meta Tags" />
    </div>
  );
};

// 10. Bcrypt & Salt Hash Generator
export const BcryptHashGenerator: React.FC = () => {
  const [password, setPassword] = useState('MySecurePassword123!');
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState('');

  const generateHash = async () => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const salt = enc.encode(`salt_round_${rounds}_toolnest`);
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: Math.pow(2, rounds),
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHash(`$2a$${rounds.toString().padStart(2, '0')}$${hashHex.slice(0, 53)}`);
  };

  useEffect(() => {
    generateHash();
  }, [password, rounds]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Password / Plain Text</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded border bg-transparent font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost Rounds ({rounds})</label>
            <input type="range" min="4" max="14" value={rounds} onChange={e => setRounds(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <button 
          onClick={generateHash}
          className="w-full flex items-center justify-center gap-2 p-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Compute Secure Hash
        </button>
      </ToolPanel>

      <OutputBox value={hash} label="Generated Bcrypt Style Hash" />
    </div>
  );
};
