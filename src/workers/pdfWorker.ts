// Universal Polyfills for modern TypedArray/Array toHex proposals inside DedicatedWorkerGlobalScope
(function() {
  function universalToHex(this: any): string {
    try {
      if (typeof this === 'string') {
        let hex = '';
        for (let i = 0; i < this.length; i++) {
          hex += (this.charCodeAt(i) & 0xff).toString(16).padStart(2, '0');
        }
        return hex;
      }
      if (this && typeof this.length === 'number') {
        let hex = '';
        for (let i = 0; i < this.length; i++) {
          const byte = Number(this[i]) & 0xff;
          hex += byte.toString(16).padStart(2, '0');
        }
        return hex;
      }
      if (typeof ArrayBuffer !== 'undefined' && this instanceof ArrayBuffer) {
        const u8 = new Uint8Array(this);
        let hex = '';
        for (let i = 0; i < u8.length; i++) {
          hex += u8[i].toString(16).padStart(2, '0');
        }
        return hex;
      }
      if (typeof this === 'number') {
        return (this & 0xff).toString(16).padStart(2, '0');
      }
      return '';
    } catch {
      return '';
    }
  }

  const targets: any[] = [
    typeof Uint8Array !== 'undefined' ? Uint8Array : null,
    typeof Uint8ClampedArray !== 'undefined' ? Uint8ClampedArray : null,
    typeof Int8Array !== 'undefined' ? Int8Array : null,
    typeof Uint16Array !== 'undefined' ? Uint16Array : null,
    typeof Uint32Array !== 'undefined' ? Uint32Array : null,
    typeof Array !== 'undefined' ? Array : null,
    typeof String !== 'undefined' ? String : null,
    typeof ArrayBuffer !== 'undefined' ? ArrayBuffer : null,
    typeof Object !== 'undefined' ? Object : null
  ];

  targets.forEach(cls => {
    if (cls && cls.prototype && !('toHex' in cls.prototype)) {
      try {
        Object.defineProperty(cls.prototype, 'toHex', {
          value: universalToHex,
          writable: true,
          configurable: true
        });
      } catch {}
    }
  });
})();

// Import the official minified PDF.js worker
import 'pdfjs-dist/build/pdf.worker.min.mjs';
