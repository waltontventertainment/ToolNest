// Global polyfills for modern JS features used by pdfjs-dist and modern browser libraries
// 1. Map & WeakMap getOrInsertComputed / getOrInsert (TC39 Stage 3 proposal)
if (typeof Map !== 'undefined') {
  if (!('getOrInsertComputed' in Map.prototype)) {
    (Map.prototype as any).getOrInsertComputed = function (key: any, callbackFunction: (k: any) => any) {
      if (this.has(key)) {
        return this.get(key);
      }
      const value = callbackFunction(key);
      this.set(key, value);
      return value;
    };
  }
  if (!('getOrInsert' in Map.prototype)) {
    (Map.prototype as any).getOrInsert = function (key: any, defaultValue: any) {
      if (this.has(key)) {
        return this.get(key);
      }
      this.set(key, defaultValue);
      return defaultValue;
    };
  }
}

if (typeof WeakMap !== 'undefined') {
  if (!('getOrInsertComputed' in WeakMap.prototype)) {
    (WeakMap.prototype as any).getOrInsertComputed = function (key: any, callbackFunction: (k: any) => any) {
      if (this.has(key)) {
        return this.get(key);
      }
      const value = callbackFunction(key);
      this.set(key, value);
      return value;
    };
  }
  if (!('getOrInsert' in WeakMap.prototype)) {
    (WeakMap.prototype as any).getOrInsert = function (key: any, defaultValue: any) {
      if (this.has(key)) {
        return this.get(key);
      }
      this.set(key, defaultValue);
      return defaultValue;
    };
  }
}

// 2. Promise.withResolvers polyfill
if (typeof Promise !== 'undefined' && !('withResolvers' in Promise)) {
  (Promise as any).withResolvers = function () {
    let resolve: any, reject: any;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 3. Uint8Array toHex polyfill
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
