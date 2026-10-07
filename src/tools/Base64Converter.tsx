import React, { useState } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';

export const Base64Converter: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);

  const getOutput = () => {
    if (!input) return '';
    try {
      if (mode === 'encode') {
        return btoa(unescape(encodeURIComponent(input)));
      } else {
        return decodeURIComponent(escape(atob(input)));
      }
    } catch (err) {
      return 'Error: Invalid input for this operation.';
    }
  };

  const output = getOutput();
  const hasError = output.startsWith('Error:');

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setMode('encode')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-brand ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            Encode to Base64
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-brand ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            Decode from Base64
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Input Text</label>
          <textarea
            className="w-full min-h-[120px] p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter plain text to encode...' : 'Enter Base64 text to decode...'}
          />
        </div>
      </ToolPanel>

      <OutputBox 
        value={hasError ? '' : output} 
        label={mode === 'encode' ? 'Base64 Encoded Output' : 'Decoded Text Output'} 
      />
      {hasError && (
        <div className="text-destructive text-sm font-medium px-4">
          {output}
        </div>
      )}
    </div>
  );
};
