import React, { useState, useEffect } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');

  const generate = () => {
    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    if (charset === '') {
      setPassword('');
      return;
    }

    let result = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    setPassword(result);
  };

  // Generate initial
  useEffect(() => {
    generate();
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  const strength = password.length > 12 && useUpper && useLower && useNumbers && useSymbols ? 'Strong' 
    : password.length > 8 ? 'Medium' 
    : password.length > 0 ? 'Weak' : 'None';
  
  const strengthColor = strength === 'Strong' ? 'text-accent' : strength === 'Medium' ? 'text-warning' : 'text-destructive';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ToolPanel className="space-y-6">
        <OutputBox value={password} label={`Generated Password - ${strength}`} className={strengthColor} />
        
        <div>
          <label className="block text-sm font-medium mb-2">Length: {length}</label>
          <input 
            type="range" min="4" max="64" value={length} 
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-primary" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} className="rounded text-primary focus:ring-primary accent-primary w-4 h-4" />
            <span>Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} className="rounded text-primary focus:ring-primary accent-primary w-4 h-4" />
            <span>Lowercase (a-z)</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="rounded text-primary focus:ring-primary accent-primary w-4 h-4" />
            <span>Numbers (0-9)</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="rounded text-primary focus:ring-primary accent-primary w-4 h-4" />
            <span>Symbols (!@#$)</span>
          </label>
        </div>

        <button onClick={generate} className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-brand font-medium">
          Regenerate Password
        </button>
      </ToolPanel>
    </div>
  );
};
