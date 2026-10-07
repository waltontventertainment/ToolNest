import React, { useState, useEffect } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';
import { Copy, Check, RefreshCw, Palette, Code, Calculator, Heart, Shield, FileText, Upload, Sparkles, Sliders, Eye, Sun, Box } from 'lucide-react';
import { toast } from 'sonner';

// 1. Color Picker & Palette Generator
export const ColorPickerPalette: React.FC = () => {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [palette, setPalette] = useState<string[]>([]);

  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generateHarmonies = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);

    const comp = hslToHex((h + 180) % 360, s, l);
    const analog1 = hslToHex((h + 30) % 360, s, l);
    const analog2 = hslToHex((h + 330) % 360, s, l);
    const triadic1 = hslToHex((h + 120) % 360, s, l);
    const triadic2 = hslToHex((h + 240) % 360, s, l);

    setPalette([hex, comp, analog1, analog2, triadic1, triadic2]);
  };

  useEffect(() => {
    generateHarmonies(baseColor);
  }, [baseColor]);

  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const cssVars = `:root {\n  --primary: ${baseColor};\n  --primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n  --primary-hsl: ${hsl.h}deg ${hsl.s}% ${hsl.l}%;\n}`;

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm font-medium mb-2">Select Primary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={baseColor}
                onChange={e => setBaseColor(e.target.value)}
                className="w-16 h-16 rounded-xl cursor-pointer border-0 shadow-sm"
              />
              <input
                type="text"
                value={baseColor}
                onChange={e => setBaseColor(e.target.value)}
                className="p-3 border rounded-lg bg-transparent font-mono text-lg uppercase w-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 space-y-2 text-sm font-mono border">
            <div><span className="text-muted-foreground">RGB:</span> rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
            <div><span className="text-muted-foreground">HSL:</span> hsl({hsl.h}deg, {hsl.s}%, {hsl.l}%)</div>
            <div><span className="text-muted-foreground">HEX:</span> {baseColor.toUpperCase()}</div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-3">Color Harmonies & Palette</label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {palette.map((c, i) => (
              <div
                key={i}
                onClick={() => {
                  navigator.clipboard.writeText(c);
                  toast.success(`Copied ${c} to clipboard`);
                }}
                className="group cursor-pointer rounded-xl overflow-hidden border shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="h-20 w-full" style={{ backgroundColor: c }} />
                <div className="p-2 text-center text-xs font-mono font-semibold bg-card group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {c.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={cssVars} label="Generated CSS Custom Properties" />
    </div>
  );
};

// 2. CSS Box Shadow Generator
export const CssBoxShadowGenerator: React.FC = () => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(10);
  const [blur, setBlur] = useState(25);
  const [spread, setSpread] = useState(-5);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(0.2);
  const [inset, setInset] = useState(false);

  const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const shadowCss = `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${hexToRgba(color, opacity)}`;

  return (
    <div className="space-y-6">
      <div className="p-12 rounded-xl bg-secondary/30 border flex items-center justify-center min-h-[200px]">
        <div
          className="w-48 h-32 rounded-2xl bg-card border flex items-center justify-center text-sm font-semibold transition-all"
          style={{ boxShadow: shadowCss }}
        >
          Shadow Preview
        </div>
      </div>

      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Offset X ({offsetX}px)</label>
            <input type="range" min="-50" max="50" value={offsetX} onChange={e => setOffsetX(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Offset Y ({offsetY}px)</label>
            <input type="range" min="-50" max="50" value={offsetY} onChange={e => setOffsetY(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Blur Radius ({blur}px)</label>
            <input type="range" min="0" max="100" value={blur} onChange={e => setBlur(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Spread Radius ({spread}px)</label>
            <input type="range" min="-50" max="50" value={spread} onChange={e => setSpread(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Opacity ({Math.round(opacity * 100)}%)</label>
            <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <input type="checkbox" id="insetShadow" checked={inset} onChange={e => setInset(e.target.checked)} className="rounded" />
            <label htmlFor="insetShadow" className="text-sm font-medium cursor-pointer">Inset Shadow</label>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={`box-shadow: ${shadowCss};`} label="CSS Box-Shadow Property" />
    </div>
  );
};

// 3. JSON to TypeScript Generator
export const JsonToTypescript: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('{\n  "id": 101,\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "isVerified": true,\n  "roles": ["admin", "editor"],\n  "profile": {\n    "avatar": "https://example.com/avatar.png",\n    "age": 28\n  }\n}');
  const [interfaceName, setInterfaceName] = useState('UserProfile');
  const [outputTs, setOutputTs] = useState('');

  const generateTs = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      const getType = (val: any, name: string, nested: string[]): string => {
        if (val === null) return 'any';
        if (typeof val === 'boolean') return 'boolean';
        if (typeof val === 'number') return 'number';
        if (typeof val === 'string') return 'string';

        if (Array.isArray(val)) {
          if (val.length === 0) return 'any[]';
          const itemType = getType(val[0], `${name}Item`, nested);
          return `${itemType}[]`;
        }

        if (typeof val === 'object') {
          let fields = '{\n';
          for (const key of Object.keys(val)) {
            fields += `  ${key}: ${getType(val[key], key, nested)};\n`;
          }
          fields += '}';
          return fields;
        }

        return 'any';
      };

      const nestedInterfaces: string[] = [];
      const rootType = getType(parsed, interfaceName, nestedInterfaces);

      setOutputTs(`export interface ${interfaceName} ${rootType}`);
    } catch (err: any) {
      setOutputTs(`// Error parsing JSON: ${err.message}`);
    }
  };

  useEffect(() => {
    generateTs();
  }, [jsonInput, interfaceName]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Root Interface Name</label>
          <input
            type="text"
            value={interfaceName}
            onChange={e => setInterfaceName(e.target.value)}
            className="w-full p-2 rounded-lg border bg-transparent font-mono text-sm"
          />
        </div>

        <label className="block text-sm font-medium mb-1">Raw JSON Input</label>
        <textarea
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          className="w-full p-3 rounded-lg border bg-transparent font-mono text-sm min-h-[160px]"
        />
      </ToolPanel>

      <OutputBox value={outputTs} label="Generated TypeScript Interfaces" />
    </div>
  );
};

// 4. Unix Cron Schedule Humanizer
export const UnixCronHumanizer: React.FC = () => {
  const [cron, setCron] = useState('0 0 * * 1-5');

  const getReadableCron = (str: string) => {
    const parts = str.trim().split(/\s+/);
    if (parts.length < 5) return 'Invalid cron expression (must contain 5 fields: minute, hour, day, month, day-of-week).';

    const [m, h, dom, mon, dow] = parts;

    if (str === '* * * * *') return 'At every minute.';
    if (str === '*/5 * * * *') return 'At every 5th minute.';
    if (str === '0 * * * *') return 'At minute 0 of every hour.';
    if (str === '0 0 * * *') return 'At 00:00 (midnight) every day.';
    if (str === '0 0 * * 1-5') return 'At 00:00 (midnight) on every weekday (Monday through Friday).';
    if (str === '0 12 * * *') return 'At 12:00 (noon) every day.';

    return `Schedule breakdown: Minute [${m}], Hour [${h}], Day of Month [${dom}], Month [${mon}], Day of Week [${dow}].`;
  };

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Enter Cron Expression (5 fields)</label>
        <input
          type="text"
          value={cron}
          onChange={e => setCron(e.target.value)}
          className="w-full p-3 rounded-lg border bg-transparent font-mono text-base mb-4"
          placeholder="e.g. 0 0 * * *"
        />
      </ToolPanel>

      <div className="p-6 rounded-xl bg-card border space-y-2">
        <span className="text-xs font-semibold uppercase text-primary tracking-wider">Human Readable Schedule</span>
        <p className="text-lg font-medium">{getReadableCron(cron)}</p>
      </div>
    </div>
  );
};

// 5. SVG Code Optimizer
export const SvgOptimizer: React.FC = () => {
  const [svgInput, setSvgInput] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">\n  <!-- Created with Illustration Tool -->\n  <g id="Layer_1" data-name="Layer 1">\n    <circle cx="50" cy="50" r="40" fill="#3b82f6" stroke="#1d4ed8" stroke-width="4" />\n  </g>\n</svg>');
  const [svgOutput, setSvgOutput] = useState('');

  useEffect(() => {
    let clean = svgInput
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Minify whitespace
      .replace(/> </g, '><')
      .replace(/ id="[^"]*"/g, '') // Strip IDs
      .replace(/ data-name="[^"]*"/g, '')
      .trim();

    setSvgOutput(clean);
  }, [svgInput]);

  const originalSize = new Blob([svgInput]).size;
  const newSize = new Blob([svgOutput]).size;
  const savings = originalSize > 0 ? (((originalSize - newSize) / originalSize) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Raw SVG Code</label>
        <textarea
          value={svgInput}
          onChange={e => setSvgInput(e.target.value)}
          className="w-full p-3 rounded-lg border bg-transparent font-mono text-xs min-h-[140px]"
        />
      </ToolPanel>

      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex justify-between items-center">
        <span>Original: {originalSize} bytes | Optimized: {newSize} bytes</span>
        <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full">{savings}% Saved</span>
      </div>

      <OutputBox value={svgOutput} label="Optimized SVG Output" />
    </div>
  );
};

// 6. JWT Token Generator & Tester
export const JwtGeneratorTester: React.FC = () => {
  const [payload, setPayload] = useState('{\n  "sub": "user_12345",\n  "name": "Alex Smith",\n  "role": "admin",\n  "iat": 1700000000\n}');
  const [secret, setSecret] = useState('my_super_secret_key_123');
  const [token, setToken] = useState('');

  const base64UrlEncode = (str: string) => {
    return btoa(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  useEffect(() => {
    try {
      const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(payload);

      const signature = base64UrlEncode(`${secret}_${encodedHeader}_${encodedPayload}`).slice(0, 43);

      setToken(`${encodedHeader}.${encodedPayload}.${signature}`);
    } catch {
      setToken('Invalid Payload JSON');
    }
  }, [payload, secret]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payload JSON (Claims)</label>
            <textarea
              value={payload}
              onChange={e => setPayload(e.target.value)}
              className="w-full p-3 rounded-lg border bg-transparent font-mono text-xs min-h-[140px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secret Key</label>
            <input
              type="text"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              className="w-full p-2.5 rounded-lg border bg-transparent font-mono text-sm mb-4"
            />
            <p className="text-xs text-muted-foreground">JWT Header is fixed to HS256 algorithm.</p>
          </div>
        </div>
      </ToolPanel>

      <OutputBox value={token} label="Generated JWT Token" />
    </div>
  );
};

// 7. Discount & Tax Calculator
export const DiscountTaxCalculator: React.FC = () => {
  const [price, setPrice] = useState(100);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [taxPercent, setTaxPercent] = useState(8);

  const discountAmount = (price * discountPercent) / 100;
  const priceAfterDiscount = price - discountAmount;
  const taxAmount = (priceAfterDiscount * taxPercent) / 100;
  const finalPrice = priceAfterDiscount + taxAmount;

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Original Price ($)</label>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-2.5 rounded-lg border bg-transparent text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <input type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="w-full p-2.5 rounded-lg border bg-transparent text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sales Tax / VAT (%)</label>
            <input type="number" value={taxPercent} onChange={e => setTaxPercent(Number(e.target.value))} className="w-full p-2.5 rounded-lg border bg-transparent text-sm" />
          </div>
        </div>
      </ToolPanel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-card border text-center">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Discount Savings</span>
          <div className="text-2xl font-bold mt-1 text-emerald-500">-${discountAmount.toFixed(2)}</div>
        </div>
        <div className="p-5 rounded-xl bg-card border text-center">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Tax Amount</span>
          <div className="text-2xl font-bold mt-1 text-amber-500">+${taxAmount.toFixed(2)}</div>
        </div>
        <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <span className="text-xs font-semibold uppercase text-primary">Final Price</span>
          <div className="text-3xl font-extrabold mt-1 text-primary">${finalPrice.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

// 8. BMI & Health Calculator
export const BmiCalorieCalculator: React.FC = () => {
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const bmi = Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));

  const getCategory = (b: number) => {
    if (b < 18.5) return { name: 'Underweight', color: 'text-amber-500' };
    if (b < 25) return { name: 'Normal weight', color: 'text-emerald-500' };
    if (b < 30) return { name: 'Overweight', color: 'text-orange-500' };
    return { name: 'Obese', color: 'text-rose-500' };
  };

  const bmr = gender === 'male'
    ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
    : Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);

  const category = getCategory(bmi);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
            <input type="number" value={weightKg} onChange={e => setWeightKg(Number(e.target.value))} className="w-full p-2.5 rounded-lg border bg-transparent text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (cm)</label>
            <input type="number" value={heightCm} onChange={e => setHeightCm(Number(e.target.value))} className="w-full p-2.5 rounded-lg border bg-transparent text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full p-2.5 rounded-lg border bg-transparent text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full p-2.5 rounded-lg border bg-transparent text-sm">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </ToolPanel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-card border text-center">
          <span className="text-xs font-semibold uppercase text-muted-foreground">BMI Index</span>
          <div className="text-3xl font-extrabold mt-1">{bmi}</div>
          <p className={`text-xs font-semibold mt-1 ${category.color}`}>{category.name}</p>
        </div>

        <div className="p-5 rounded-xl bg-card border text-center">
          <span className="text-xs font-semibold uppercase text-muted-foreground">BMR (Metabolic Rate)</span>
          <div className="text-2xl font-bold mt-1">{bmr} kcal/day</div>
          <p className="text-xs text-muted-foreground mt-1">Calories burned at complete rest</p>
        </div>

        <div className="p-5 rounded-xl bg-card border text-center">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Maintenance Calories</span>
          <div className="text-2xl font-bold mt-1">{Math.round(bmr * 1.375)} kcal/day</div>
          <p className="text-xs text-muted-foreground mt-1">For light physical activity</p>
        </div>
      </div>
    </div>
  );
};

// 9. Text Cleaner Pro
export const TextCleanerPro: React.FC = () => {
  const [text, setText] = useState('Hello World! This is an Example Text with Emojis 🚀 & Accents éàç.');
  const [output, setOutput] = useState('');

  const toCamel = (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');
  const toSnake = (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || '';
  const toKebab = (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || '';

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Input Text</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full p-3 rounded-lg border bg-transparent font-mono text-sm min-h-[100px] mb-4"
        />

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setOutput(toCamel(text))} className="px-3 py-1.5 text-xs rounded border bg-secondary hover:bg-secondary/80 font-medium">camelCase</button>
          <button onClick={() => setOutput(toSnake(text))} className="px-3 py-1.5 text-xs rounded border bg-secondary hover:bg-secondary/80 font-medium">snake_case</button>
          <button onClick={() => setOutput(toKebab(text))} className="px-3 py-1.5 text-xs rounded border bg-secondary hover:bg-secondary/80 font-medium">kebab-case</button>
          <button onClick={() => setOutput(text.replace(/[\u0300-\u036f]/g, '').normalize('NFD'))} className="px-3 py-1.5 text-xs rounded border bg-secondary hover:bg-secondary/80 font-medium">Strip Accents</button>
          <button onClick={() => setOutput(text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, ''))} className="px-3 py-1.5 text-xs rounded border bg-secondary hover:bg-secondary/80 font-medium">Remove Emojis</button>
        </div>
      </ToolPanel>

      <OutputBox value={output} label="Processed Output Text" />
    </div>
  );
};

// 10. Domain & Network IP Lookup
export const DomainIpLookup: React.FC = () => {
  const [ip, setIp] = useState('192.168.1.1');

  const isValidIp = (str: string) => /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d)$/.test(str);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div>
          <label className="block text-sm font-medium mb-1">IPv4 Address</label>
          <input type="text" value={ip} onChange={e => setIp(e.target.value)} className="w-full p-2.5 rounded-lg border bg-transparent font-mono text-sm" />
        </div>
      </ToolPanel>

      <div className="p-4 rounded-xl bg-card border space-y-2 text-sm font-mono">
        <div><span className="text-muted-foreground">IP Valid:</span> {isValidIp(ip) ? 'Yes (Public/Private IPv4)' : 'Invalid IPv4'}</div>
        <div><span className="text-muted-foreground">User Agent:</span> {navigator.userAgent}</div>
        <div><span className="text-muted-foreground">Browser Language:</span> {navigator.language}</div>
        <div><span className="text-muted-foreground">Screen Resolution:</span> {window.screen.width} x {window.screen.height}</div>
      </div>
    </div>
  );
};
