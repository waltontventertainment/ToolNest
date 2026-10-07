// Global polyfill for Uint8Array.prototype.toHex (required for environments lacking TC39 toHex)
const installToHex = (target: any) => {
  if (target && !('toHex' in target.prototype)) {
    try {
      Object.defineProperty(target.prototype, 'toHex', {
        value: function toHex(): string {
          let hex = '';
          const len = this && typeof this.length === 'number' ? this.length : 0;
          for (let i = 0; i < len; i++) {
            const byte = Number(this[i]) & 0xff;
            hex += byte.toString(16).padStart(2, '0');
          }
          return hex;
        },
        writable: true,
        configurable: true,
      });
    } catch {
      // safe ignore
    }
  }
};

if (typeof Uint8Array !== 'undefined') installToHex(Uint8Array);
if (typeof Uint8ClampedArray !== 'undefined') installToHex(Uint8ClampedArray);
if (typeof Int8Array !== 'undefined') installToHex(Int8Array);
if (typeof Array !== 'undefined' && !('toHex' in Array.prototype)) {
  try {
    Object.defineProperty(Array.prototype, 'toHex', {
      value: function toHex(): string {
        let hex = '';
        for (let i = 0; i < this.length; i++) {
          const byte = Number(this[i]) & 0xff;
          hex += byte.toString(16).padStart(2, '0');
        }
        return hex;
      },
      writable: true,
      configurable: true,
    });
  } catch {
    // safe ignore
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
