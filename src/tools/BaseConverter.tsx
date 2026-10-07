import React, { useState } from 'react';
import { ToolPanel, CopyButton } from '../lib/toolkit';

export const BaseConverter: React.FC = () => {
  const [value, setValue] = useState('0');
  const [base, setBase] = useState<10 | 2 | 8 | 16>(10);

  const getDecimal = () => {
    if (!value) return 0;
    try {
      const parsed = parseInt(value, base);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  };

  const dec = getDecimal();

  const handleUpdate = (val: string, newBase: 10 | 2 | 8 | 16) => {
    // Keep raw string for active input
    setValue(val);
    setBase(newBase);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ToolPanel className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium">Decimal (Base 10)</label>
            <CopyButton text={dec.toString(10)} />
          </div>
          <input
            type="text"
            className="w-full p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            value={base === 10 ? value : dec.toString(10)}
            onChange={(e) => handleUpdate(e.target.value.replace(/[^0-9-]/g, ''), 10)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium">Binary (Base 2)</label>
            <CopyButton text={dec.toString(2)} />
          </div>
          <input
            type="text"
            className="w-full p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            value={base === 2 ? value : dec.toString(2)}
            onChange={(e) => handleUpdate(e.target.value.replace(/[^01-]/g, ''), 2)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium">Hexadecimal (Base 16)</label>
            <CopyButton text={dec.toString(16).toUpperCase()} />
          </div>
          <input
            type="text"
            className="w-full p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring font-mono uppercase"
            value={base === 16 ? value : dec.toString(16).toUpperCase()}
            onChange={(e) => handleUpdate(e.target.value.replace(/[^0-9a-fA-F-]/g, ''), 16)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium">Octal (Base 8)</label>
            <CopyButton text={dec.toString(8)} />
          </div>
          <input
            type="text"
            className="w-full p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            value={base === 8 ? value : dec.toString(8)}
            onChange={(e) => handleUpdate(e.target.value.replace(/[^0-7-]/g, ''), 8)}
          />
        </div>
      </ToolPanel>
    </div>
  );
};
