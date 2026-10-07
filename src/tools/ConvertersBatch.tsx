import React, { useState, useEffect } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';

export const TemperatureConverter: React.FC = () => {
  const [value, setValue] = useState('0');
  const [from, setFrom] = useState('celsius');
  const [results, setResults] = useState<{ c: string; f: string; k: string }>({ c: '0', f: '32', k: '273.15' });

  useEffect(() => {
    const v = parseFloat(value);
    if (isNaN(v)) {
      setResults({ c: '', f: '', k: '' });
      return;
    }
    let c = 0;
    if (from === 'celsius') c = v;
    else if (from === 'fahrenheit') c = (v - 32) * 5 / 9;
    else if (from === 'kelvin') c = v - 273.15;

    setResults({
      c: c.toFixed(2),
      f: ((c * 9 / 5) + 32).toFixed(2),
      k: (c + 273.15).toFixed(2)
    });
  }, [value, from]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input type="number" className="w-full p-2 rounded-md bg-transparent border-input border" value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Unit</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border" value={from} onChange={e => setFrom(e.target.value)}>
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
              <option value="kelvin">Kelvin (K)</option>
            </select>
          </div>
        </div>
      </ToolPanel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OutputBox value={results.c} label="Celsius (°C)" />
        <OutputBox value={results.f} label="Fahrenheit (°F)" />
        <OutputBox value={results.k} label="Kelvin (K)" />
      </div>
    </div>
  );
};

export const LengthConverter: React.FC = () => {
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState('meter');
  const [to, setTo] = useState('feet');
  const [result, setResult] = useState('');

  const units: Record<string, number> = {
    millimeter: 0.001, centimeter: 0.01, meter: 1, kilometer: 1000,
    inch: 0.0254, feet: 0.3048, yard: 0.9144, mile: 1609.344
  };

  useEffect(() => {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult(''); return; }
    const inMeters = v * units[from];
    setResult((inMeters / units[to]).toString());
  }, [value, from, to]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input type="number" className="w-full p-2 rounded-md bg-transparent border-input border" value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={from} onChange={e => setFrom(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={to} onChange={e => setTo(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </ToolPanel>
      <OutputBox value={result} label="Result" />
    </div>
  );
};

export const WeightConverter: React.FC = () => {
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState('kilogram');
  const [to, setTo] = useState('pound');
  const [result, setResult] = useState('');

  const units: Record<string, number> = {
    milligram: 0.000001, gram: 0.001, kilogram: 1, metric_ton: 1000,
    ounce: 0.0283495, pound: 0.453592, stone: 6.35029
  };

  useEffect(() => {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult(''); return; }
    const inKg = v * units[from];
    setResult((inKg / units[to]).toString());
  }, [value, from, to]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input type="number" className="w-full p-2 rounded-md bg-transparent border-input border" value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={from} onChange={e => setFrom(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={to} onChange={e => setTo(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </ToolPanel>
      <OutputBox value={result} label="Result" />
    </div>
  );
};

export const VolumeConverter: React.FC = () => {
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState('liter');
  const [to, setTo] = useState('gallon_us');
  const [result, setResult] = useState('');

  const units: Record<string, number> = {
    milliliter: 0.001, liter: 1, cubic_meter: 1000,
    teaspoon_us: 0.00492892, tablespoon_us: 0.0147868, fluid_ounce_us: 0.0295735, cup_us: 0.236588, pint_us: 0.473176, quart_us: 0.946353, gallon_us: 3.78541,
    gallon_uk: 4.54609
  };

  useEffect(() => {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult(''); return; }
    const inLiters = v * units[from];
    setResult((inLiters / units[to]).toString());
  }, [value, from, to]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input type="number" className="w-full p-2 rounded-md bg-transparent border-input border" value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={from} onChange={e => setFrom(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={to} onChange={e => setTo(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </ToolPanel>
      <OutputBox value={result} label="Result" />
    </div>
  );
};

export const DataStorageConverter: React.FC = () => {
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState('gigabyte');
  const [to, setTo] = useState('megabyte');
  const [result, setResult] = useState('');

  const units: Record<string, number> = {
    bit: 1/8, byte: 1, 
    kilobyte: 1024, megabyte: 1024**2, gigabyte: 1024**3, terabyte: 1024**4, petabyte: 1024**5
  };

  useEffect(() => {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult(''); return; }
    const inBytes = v * units[from];
    setResult((inBytes / units[to]).toString());
  }, [value, from, to]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input type="number" className="w-full p-2 rounded-md bg-transparent border-input border" value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={from} onChange={e => setFrom(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={to} onChange={e => setTo(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </ToolPanel>
      <OutputBox value={result} label="Result" />
    </div>
  );
};

export const AngleConverter: React.FC = () => {
  const [value, setValue] = useState('180');
  const [from, setFrom] = useState('degree');
  const [to, setTo] = useState('radian');
  const [result, setResult] = useState('');

  const units: Record<string, number> = {
    degree: 1, radian: 180 / Math.PI, gradian: 0.9, turn: 360, minute: 1/60, second: 1/3600
  };

  useEffect(() => {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult(''); return; }
    const inDegrees = v * units[from];
    setResult((inDegrees / units[to]).toString());
  }, [value, from, to]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input type="number" className="w-full p-2 rounded-md bg-transparent border-input border" value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={from} onChange={e => setFrom(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select className="w-full p-2 rounded-md bg-transparent border-input border capitalize" value={to} onChange={e => setTo(e.target.value)}>
              {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </ToolPanel>
      <OutputBox value={result} label="Result" />
    </div>
  );
};

export const Rot13Converter: React.FC = () => {
  const [input, setInput] = useState('Hello World');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const rot13 = (s: string) => s.replace(/[a-zA-Z]/g, function (c) {
      const code = c.charCodeAt(0);
      const isUpper = code <= 90;
      const limit = isUpper ? 90 : 122;
      const newCode = code + 13;
      return String.fromCharCode(newCode > limit ? newCode - 26 : newCode);
    });
    setOutput(rot13(input));
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Text</label>
        <textarea className="w-full min-h-[150px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text..." />
      </ToolPanel>
      <OutputBox value={output} label="ROT13 Output" />
    </div>
  );
};

export const TextToOctal: React.FC = () => {
  const [input, setInput] = useState('hello');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const enc = new TextEncoder();
    setOutput(Array.from(enc.encode(input)).map(b => b.toString(8).padStart(3, '0')).join(' '));
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Text Input</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} placeholder="Text..." />
      </ToolPanel>
      <OutputBox value={output} label="Octal Values" />
    </div>
  );
};

export const OctalToText: React.FC = () => {
  const [input, setInput] = useState('150 145 154 154 157');
  const [output, setOutput] = useState('');

  useEffect(() => {
    try {
      const arr = input.split(/\s+/).filter(Boolean).map(o => parseInt(o, 8));
      if (arr.some(isNaN)) {
        setOutput('Invalid Octal');
        return;
      }
      const dec = new TextDecoder();
      setOutput(dec.decode(new Uint8Array(arr)));
    } catch {
      setOutput('Invalid Octal');
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Octal Input (space separated)</label>
        <textarea className="w-full min-h-[100px] p-3 rounded-md bg-transparent border-input border font-mono custom-scrollbar" value={input} onChange={e => setInput(e.target.value)} placeholder="150 145..." />
      </ToolPanel>
      <OutputBox value={output} label="Decoded Text" />
    </div>
  );
};

export const RomanNumeralConverter: React.FC = () => {
  const [mode, setMode] = useState<'to_roman' | 'to_number'>('to_roman');
  const [input, setInput] = useState('2024');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) { setOutput(''); return; }
    
    if (mode === 'to_roman') {
      let num = parseInt(input);
      if (isNaN(num) || num < 1 || num > 3999) {
        setOutput('Please enter a number between 1 and 3999');
        return;
      }
      const romanMatrix: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
      ];
      let res = '';
      for (const [val, char] of romanMatrix) {
        while (num >= val) {
          res += char;
          num -= val;
        }
      }
      setOutput(res);
    } else {
      const romanMap: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
      const str = input.toUpperCase();
      let res = 0;
      for (let i = 0; i < str.length; i++) {
        const curr = romanMap[str[i]];
        const next = romanMap[str[i + 1]];
        if (!curr) {
          setOutput('Invalid Roman Numeral');
          return;
        }
        if (next && curr < next) {
          res -= curr;
        } else {
          res += curr;
        }
      }
      setOutput(res.toString());
    }
  }, [input, mode]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex gap-4 mb-4">
          <button 
            className={`px-4 py-2 rounded-md ${mode === 'to_roman' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            onClick={() => { setMode('to_roman'); setInput(''); }}
          >Number to Roman</button>
          <button 
            className={`px-4 py-2 rounded-md ${mode === 'to_number' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            onClick={() => { setMode('to_number'); setInput(''); }}
          >Roman to Number</button>
        </div>
        <label className="block text-sm font-medium mb-1">
          {mode === 'to_roman' ? 'Number (1-3999)' : 'Roman Numeral'}
        </label>
        <input type="text" className="w-full p-2 rounded-md bg-transparent border-input border font-mono" value={input} onChange={e => setInput(e.target.value)} />
      </ToolPanel>
      <OutputBox value={output} label="Result" />
    </div>
  );
};
