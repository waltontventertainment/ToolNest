import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

interface Point {
  x: number;
  y: number;
}

/**
 * Standard W3C SVG Arc to Center parameterization for exact path discretization
 */
function sampleSvgArc(
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  largeArcFlag: number,
  sweepFlag: number,
  x2: number,
  y2: number,
  steps = 40
): Point[] {
  const dx2 = (x1 - x2) / 2.0;
  const dy2 = (y1 - y2) / 2.0;

  let rxSq = rx * rx;
  let rySq = ry * ry;
  const x1pSq = dx2 * dx2;
  const y1pSq = dy2 * dy2;

  // Ensure radii are large enough
  const radiiCheck = x1pSq / rxSq + y1pSq / rySq;
  if (radiiCheck > 1) {
    const scale = Math.sqrt(radiiCheck);
    rx *= scale;
    ry *= scale;
    rxSq = rx * rx;
    rySq = ry * ry;
  }

  const sign = largeArcFlag === sweepFlag ? -1 : 1;
  const sq = Math.max(
    0,
    (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) / (rxSq * y1pSq + rySq * x1pSq)
  );
  const coef = sign * Math.sqrt(sq);
  const cxp = coef * ((rx * dy2) / ry);
  const cyp = coef * (-(ry * dx2) / rx);

  const cx = cxp + (x1 + x2) / 2.0;
  const cy = cyp + (y1 + y2) / 2.0;

  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const dot = ux * vx + uy * vy;
    const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    let ang = Math.acos(Math.max(-1, Math.min(1, dot / len)));
    if (ux * vy - uy * vx < 0) ang = -ang;
    return ang;
  };

  const theta1 = angle(1, 0, (dx2 - cxp) / rx, (dy2 - cyp) / ry);
  let dtheta = angle(
    (dx2 - cxp) / rx,
    (dy2 - cyp) / ry,
    (-dx2 - cxp) / rx,
    (-dy2 - cyp) / ry
  );

  if (!sweepFlag && dtheta > 0) {
    dtheta -= 2 * Math.PI;
  } else if (sweepFlag && dtheta < 0) {
    dtheta += 2 * Math.PI;
  }

  const pts: Point[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = theta1 + (dtheta * i) / steps;
    pts.push({
      x: cx + rx * Math.cos(t),
      y: cy + ry * Math.sin(t),
    });
  }
  return pts;
}

/**
 * Builds the exact closed polygon for the Lucide Wrench icon:
 * M14.7 6.3 a1 1 0 0 0 0 1.4 l1.6 1.6 a1 1 0 0 0 1.4 0 l3.77-3.77
 * a6 6 0 0 1-7.94 7.94 l-6.91 6.91 a2.12 2.12 0 0 1-3-3 l6.91-6.91
 * a6 6 0 0 1 7.94-7.94 l-3.76 3.76 z
 */
function buildWrenchPolygon(): Point[] {
  const poly: Point[] = [{ x: 14.7, y: 6.3 }];
  // 1. a 1 1 0 0 0 0 1.4 -> (14.7, 7.7)
  poly.push(...sampleSvgArc(14.7, 6.3, 1, 1, 0, 0, 14.7, 7.7, 20));
  // 2. l 1.6 1.6 -> (16.3, 9.3)
  poly.push({ x: 16.3, y: 9.3 });
  // 3. a 1 1 0 0 0 1.4 0 -> (17.7, 9.3)
  poly.push(...sampleSvgArc(16.3, 9.3, 1, 1, 0, 0, 17.7, 9.3, 20));
  // 4. l 3.77 -3.77 -> (21.47, 5.53)
  poly.push({ x: 21.47, y: 5.53 });
  // 5. a 6 6 0 0 1 -7.94 7.94 -> (13.53, 13.47)
  poly.push(...sampleSvgArc(21.47, 5.53, 6, 6, 0, 1, 13.53, 13.47, 64));
  // 6. l -6.91 6.91 -> (6.62, 20.38)
  poly.push({ x: 6.62, y: 20.38 });
  // 7. a 2.12 2.12 0 0 1 -3 -3 -> (3.62, 17.38)
  poly.push(...sampleSvgArc(6.62, 20.38, 2.12, 2.12, 0, 1, 3.62, 17.38, 36));
  // 8. l 6.91 -6.91 -> (10.53, 10.47)
  poly.push({ x: 10.53, y: 10.47 });
  // 9. a 6 6 0 0 1 7.94 -7.94 -> (18.47, 2.53)
  poly.push(...sampleSvgArc(10.53, 10.47, 6, 6, 0, 1, 18.47, 2.53, 64));
  return poly;
}

/**
 * Exact 2D Signed Distance Field for an arbitrary closed polygon (negative inside, positive outside)
 */
function sdPolygon(px: number, py: number, v: Point[]): number {
  const n = v.length;
  let d = (px - v[0].x) * (px - v[0].x) + (py - v[0].y) * (py - v[0].y);
  let s = 1.0;
  for (let i = 0, j = n - 1; i < n; j = i, i++) {
    const ex = v[j].x - v[i].x;
    const ey = v[j].y - v[i].y;
    const wx = px - v[i].x;
    const wy = py - v[i].y;
    const b = Math.max(0.0, Math.min(1.0, (wx * ex + wy * ey) / (ex * ex + ey * ey)));
    const bx = wx - ex * b;
    const by = wy - ey * b;
    d = Math.min(d, bx * bx + by * by);

    const c1 = py >= v[i].y;
    const c2 = py < v[j].y;
    const c3 = ex * wy > ey * wx;
    if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) {
      s = -s;
    }
  }
  return s * Math.sqrt(d);
}

/**
 * Signed Distance Field for a rounded box centered at (cx, cy) with width w, height h, and corner radius r
 */
function sdRoundedBox(px: number, py: number, cx: number, cy: number, w: number, h: number, r: number): number {
  const qx = Math.abs(px - cx) - (w * 0.5 - r);
  const qy = Math.abs(py - cy) - (h * 0.5 - r);
  const outDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inDist = Math.min(Math.max(qx, qy), 0);
  return outDist + inDist - r;
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  const ct = clamp(t, 0, 1);
  return [lerp(c1[0], c2[0], ct), lerp(c1[1], c2[1], ct), lerp(c1[2], c2[2], ct)];
}

/**
 * Alpha-composites foreground (fr, fg, fb, fa) over background (br, bg, bb, ba) in premultiplied space
 */
function blendOver(
  br: number,
  bg: number,
  bb: number,
  ba: number,
  fr: number,
  fg: number,
  fb: number,
  fa: number
): [number, number, number, number] {
  const a = clamp(fa, 0, 1);
  if (a <= 0) return [br, bg, bb, ba];
  if (a >= 1) return [fr, fg, fb, 1];
  const outA = a + ba * (1 - a);
  if (outA <= 1e-6) return [0, 0, 0, 0];
  const outR = (fr * a + br * ba * (1 - a)) / outA;
  const outG = (fg * a + bg * ba * (1 - a)) / outA;
  const outB = (fb * a + bb * ba * (1 - a)) / outA;
  return [outR, outG, outB, outA];
}

/**
 * Encodes a raw RGBA buffer (width * height * 4) into a valid lossless 32-bit PNG Buffer
 */
function encodePng32(width: number, height: number, rgba: Uint8Array): Buffer {
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    rawScanlines[rowStart] = 0; // Filter type 0 (None)
    const srcStart = y * width * 4;
    rgba.subarray(srcStart, srcStart + width * 4).forEach((val, idx) => {
      rawScanlines[rowStart + 1 + idx] = val;
    });
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  const crc32 = (buf: Buffer): number => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  const makeChunk = (type: string, data: Buffer): Buffer => {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcInput = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(crcInput), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  };

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Renders the Toolzaro 3D Wrench Logo at 512x512 in 3 modes:
 * - 'standard': Transparent outer corners with full 3D extruded rounded badge (for browser tabs, Google Search, Android any)
 * - 'apple': Soft dark obsidian backdrop with full 3D badge (iOS Safari requires opaque apple-touch-icon)
 * - 'maskable': Full-bleed royal indigo-purple 3D surface for Android adaptive icon safe-zone
 */
export function renderToolzaro3DLogoPng(
  size = 512,
  mode: 'standard' | 'apple' | 'maskable' = 'standard'
): Buffer {
  const wrenchPoly = buildWrenchPolygon();
  const rgba = new Uint8Array(size * size * 4);
  const scaleTo512 = 512 / size;
  // Use 8x8 (64x) supersampling on 16x16 & 32x32, 4x4 (16x) on 48x48 & 96x96, and 2x2 (4x) on 180/192/512
  const subSamples = size <= 32 ? 8 : size <= 96 ? 4 : 2;
  const aa = (size <= 32 ? 0.42 : 0.75) * scaleTo512;

  // Color palette matching .logo-3d in src/index.css
  const cTopPurple: [number, number, number] = [139, 92, 246]; // #8b5cf6
  const cMidIndigo: [number, number, number] = [99, 102, 241]; // #6366f1
  const cBotIndigo: [number, number, number] = [79, 70, 229]; // #4f46e5

  const cExtrusionTop: [number, number, number] = [55, 48, 163]; // #3730a3
  const cExtrusionBot: [number, number, number] = [30, 27, 75]; // #1e1b4b

  // Optical sizing for small icons (16x16, 32x32) so the badge & wrench fill the pixel grid crisply on legacy & low-DPI screens
  const isTiny = size <= 16;
  const isSmall = size <= 32;
  const badgeW = isTiny ? 500 : isSmall ? 492 : 476;
  const badgeH = isTiny ? 476 : isSmall ? 468 : 450;
  const badgeR = isTiny ? 156 : isSmall ? 164 : 172;
  const wrenchScale = mode === 'maskable' ? 10.5 : isTiny ? 13.6 : isSmall ? 13.0 : 12.0;
  const wrenchStroke = isTiny ? 1.28 : isSmall ? 1.18 : 1.08;

  const evalSample = (x: number, y: number): [number, number, number, number] => {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;

    // 1. Optional Full-Bleed Backdrop for Apple Touch / Maskable
    if (mode === 'apple') {
      const bgT = clamp((x + y) / 1024, 0, 1);
      const bgCol = lerpColor([18, 16, 40], [10, 9, 24], bgT);
      r = bgCol[0];
      g = bgCol[1];
      b = bgCol[2];
      a = 1;
    } else if (mode === 'maskable') {
      const diagT = clamp((x * 0.65 + y * 0.75) / 720, 0, 1);
      const surfCol =
        diagT < 0.5
          ? lerpColor(cTopPurple, cMidIndigo, diagT * 2)
          : lerpColor(cMidIndigo, cBotIndigo, (diagT - 0.5) * 2);
      r = surfCol[0];
      g = surfCol[1];
      b = surfCol[2];
      a = 1;
    }

    if (mode !== 'maskable') {
      // 2. Soft Ambient Drop Shadow below the 3D badge
      const sdShadow = sdRoundedBox(x, y, 256, 274, badgeW - 14, badgeH - 2, badgeR - 4);
      const shadowAlpha = (1 - smoothstep(-10, 18, sdShadow)) * 0.32;
      if (shadowAlpha > 0) {
        [r, g, b, a] = blendOver(r, g, b, a, 15, 23, 42, shadowAlpha);
      }

      // 3. 3D Physical Extrusion Base (Bottom Ledge)
      const sdExt = sdRoundedBox(x, y, 256, 265, badgeW, badgeH + 4, badgeR);
      const extAlpha = 1 - smoothstep(-aa, aa, sdExt);
      if (extAlpha > 0) {
        const extT = clamp((x + y) / 1024, 0, 1);
        const extCol = lerpColor(cExtrusionTop, cExtrusionBot, extT);
        [r, g, b, a] = blendOver(r, g, b, a, extCol[0], extCol[1], extCol[2], extAlpha);
      }

      // 4. Main 3D Top Surface
      const sdMain = sdRoundedBox(x, y, 256, 239, badgeW, badgeH, badgeR);
      const mainAlpha = 1 - smoothstep(-aa, aa, sdMain);
      if (mainAlpha > 0) {
        const diagT = clamp(((x - 18) * 0.65 + (y - 14) * 0.75) / 650, 0, 1);
        let surfCol =
          diagT < 0.5
            ? lerpColor(cTopPurple, cMidIndigo, diagT * 2)
            : lerpColor(cMidIndigo, cBotIndigo, (diagT - 0.5) * 2);

        // Top Glossy Specular Highlight Sheen
        if (y < 260) {
          const glossT = clamp(1 - (y - 14) / 235, 0, 1);
          const glossStrength = glossT * glossT * 0.42;
          surfCol = lerpColor(surfCol, [255, 255, 255], glossStrength);
        }

        // Inner 3D Specular Rim Border
        const rimDist = Math.abs(sdMain + 4.5);
        const rimMask = 1 - smoothstep(0, 4.2, rimDist);
        if (rimMask > 0) {
          const rimTopFactor = clamp(1 - (y - 14) / 440, 0, 1);
          const rimColor: [number, number, number] =
            rimTopFactor > 0.35 ? [255, 255, 255] : [30, 27, 75];
          const rimOpacity =
            rimTopFactor > 0.35
              ? lerp(0.28, 0.78, (rimTopFactor - 0.35) / 0.65)
              : lerp(0.32, 0.15, rimTopFactor / 0.35);
          surfCol = lerpColor(surfCol, rimColor, rimMask * rimOpacity);
        }

        [r, g, b, a] = blendOver(r, g, b, a, surfCol[0], surfCol[1], surfCol[2], mainAlpha);
      }
    }

    // 5. 3D Wrench Icon + Drop Shadow inside the badge
    const wrenchOriginX = 256 - 12 * wrenchScale;
    const wrenchOriginY = (mode === 'maskable' ? 256 : 240) - 12 * wrenchScale;

    if (x >= 60 && x <= 452 && y >= 50 && y <= 450) {
      // 5a. Wrench 3D Drop Shadow (shifted down by +14px)
      const sx = (x - wrenchOriginX) / wrenchScale;
      const sy = (y - (wrenchOriginY + 14)) / wrenchScale;
      if (sx >= 0.5 && sx <= 23.5 && sy >= 0.5 && sy <= 23.5) {
        const dShadow = (sdPolygon(sx, sy, wrenchPoly) - wrenchStroke) * wrenchScale;
        const wShadowAlpha = (1 - smoothstep(-aa * 1.4, aa * 2.2, dShadow)) * 0.42;
        if (wShadowAlpha > 0) {
          [r, g, b, a] = blendOver(r, g, b, a, 20, 18, 56, wShadowAlpha);
        }
      }

      // 5b. Main Crisp White 3D Wrench
      const wx = (x - wrenchOriginX) / wrenchScale;
      const wy = (y - wrenchOriginY) / wrenchScale;
      if (wx >= 0.5 && wx <= 23.5 && wy >= 0.5 && wy <= 23.5) {
        const dWrench = (sdPolygon(wx, wy, wrenchPoly) - wrenchStroke) * wrenchScale;
        const wAlpha = 1 - smoothstep(-aa, aa, dWrench);
        if (wAlpha > 0) {
          const wGradT = clamp((wx + wy) / 28, 0, 1);
          let wCol = lerpColor([255, 255, 255], [238, 242, 255], wGradT);
          if (dWrench > -5.5 && wy > wx) {
            const bevelT = clamp(1 - Math.abs(dWrench + 2.2) / 3.3, 0, 1);
            wCol = lerpColor(wCol, [199, 210, 254], bevelT * 0.45);
          }
          [r, g, b, a] = blendOver(r, g, b, a, wCol[0], wCol[1], wCol[2], wAlpha);
        }
      }
    }

    return [r, g, b, a];
  };

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let accR = 0;
      let accG = 0;
      let accB = 0;
      let accA = 0;

      for (let sy = 0; sy < subSamples; sy++) {
        const y = (py + (sy + 0.5) / subSamples) * scaleTo512;
        for (let sx = 0; sx < subSamples; sx++) {
          const x = (px + (sx + 0.5) / subSamples) * scaleTo512;
          const [sr, sg, sb, sa] = evalSample(x, y);
          // Accumulate premultiplied for accurate supersampling
          accR += sr * sa;
          accG += sg * sa;
          accB += sb * sa;
          accA += sa;
        }
      }

      const totalSamples = subSamples * subSamples;
      const finalA = accA / totalSamples;
      const finalR = finalA > 1e-6 ? accR / accA : 0;
      const finalG = finalA > 1e-6 ? accG / accA : 0;
      const finalB = finalA > 1e-6 ? accB / accA : 0;

      const idx = (py * size + px) * 4;
      rgba[idx] = Math.round(clamp(finalR, 0, 255));
      rgba[idx + 1] = Math.round(clamp(finalG, 0, 255));
      rgba[idx + 2] = Math.round(clamp(finalB, 0, 255));
      rgba[idx + 3] = Math.round(clamp(finalA * 255, 0, 255));
    }
  }

  return encodePng32(size, size, rgba);
}

export function generateAll3DFavicons(publicDir: string, distDir?: string) {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Render exact native resolutions directly using analytical SDF + 4x4 SSAA anti-aliasing
  const sizesToRender: Array<{ file: string; size: number; mode: 'standard' | 'apple' | 'maskable' }> = [
    { file: 'android-chrome-512x512.png', size: 512, mode: 'standard' },
    { file: 'android-chrome-maskable-512x512.png', size: 512, mode: 'maskable' },
    { file: 'logo.png', size: 512, mode: 'standard' },
    { file: 'android-chrome-192x192.png', size: 192, mode: 'standard' },
    { file: 'apple-touch-icon.png', size: 180, mode: 'apple' },
    { file: 'favicon-96x96.png', size: 96, mode: 'standard' },
    { file: 'favicon.png', size: 96, mode: 'standard' },
    { file: 'favicon-48x48.png', size: 48, mode: 'standard' },
    { file: 'favicon-32x32.png', size: 32, mode: 'standard' },
    { file: 'favicon-16x16.png', size: 16, mode: 'standard' },
  ];

  const cache = new Map<string, Buffer>();

  for (const item of sizesToRender) {
    const key = `${item.size}:${item.mode}`;
    let buf = cache.get(key);
    if (!buf) {
      buf = renderToolzaro3DLogoPng(item.size, item.mode);
      cache.set(key, buf);
    }
    const outPath = path.join(publicDir, item.file);
    fs.writeFileSync(outPath, buf);
    if (distDir && fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, item.file), buf);
    }
  }

  // Build multi-resolution 32-bit RGBA favicon.ico (48x48 + 32x32 + 16x16 lossless PNG-in-ICO container)
  const png48 = cache.get('48:standard') || fs.readFileSync(path.join(publicDir, 'favicon-48x48.png'));
  const png32 = cache.get('32:standard') || fs.readFileSync(path.join(publicDir, 'favicon-32x32.png'));
  const png16 = cache.get('16:standard') || fs.readFileSync(path.join(publicDir, 'favicon-16x16.png'));
  const frames = [
    { size: 48, buf: png48 },
    { size: 32, buf: png32 },
    { size: 16, buf: png16 },
  ];
  const headerSize = 6 + frames.length * 16;
  const icoHeader = Buffer.alloc(headerSize);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type 1 = ICO
  icoHeader.writeUInt16LE(frames.length, 4); // Image count

  let currentOffset = headerSize;
  frames.forEach((frame, i) => {
    const entryOffset = 6 + i * 16;
    icoHeader[entryOffset] = frame.size === 256 ? 0 : frame.size; // Width
    icoHeader[entryOffset + 1] = frame.size === 256 ? 0 : frame.size; // Height
    icoHeader[entryOffset + 2] = 0; // Color palette
    icoHeader[entryOffset + 3] = 0; // Reserved
    icoHeader.writeUInt16LE(1, entryOffset + 4); // Color planes
    icoHeader.writeUInt16LE(32, entryOffset + 6); // 32 bits per pixel (RGBA)
    icoHeader.writeUInt32LE(frame.buf.length, entryOffset + 8); // Size of PNG data
    icoHeader.writeUInt32LE(currentOffset, entryOffset + 12); // Offset
    currentOffset += frame.buf.length;
  });

  const icoBuffer = Buffer.concat([icoHeader, ...frames.map(f => f.buf)]);
  const icoPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  if (distDir && fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'favicon.ico'), icoBuffer);
  }

  // Also mirror favicon.svg to dist/ if dist/ exists
  const svgPath = path.join(publicDir, 'favicon.svg');
  if (distDir && fs.existsSync(distDir) && fs.existsSync(svgPath)) {
    fs.copyFileSync(svgPath, path.join(distDir, 'favicon.svg'));
  }
}
