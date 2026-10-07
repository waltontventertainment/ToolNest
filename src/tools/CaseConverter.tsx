import React, { useState } from 'react';
import { ToolPanel, OutputBox, CopyButton } from '../lib/toolkit';

export const CaseConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab'>('upper');

  const convert = (text: string, m: typeof mode) => {
    switch (m) {
      case 'upper': return text.toUpperCase();
      case 'lower': return text.toLowerCase();
      case 'title': return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
      case 'camel': return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');
      case 'snake': return text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || '';
      case 'kebab': return text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || '';
      default: return text;
    }
  };

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Input Text</label>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to convert..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['upper', 'lower', 'title', 'camel', 'snake', 'kebab'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-brand ${mode === m ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </ToolPanel>
      
      <OutputBox value={convert(input, mode)} />
    </div>
  );
};
