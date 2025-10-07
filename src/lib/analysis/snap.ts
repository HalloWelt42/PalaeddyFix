import type { RGB } from "./convert";
import { deltaE2000 } from "./distance";

export type DitherMode = "none" | "floyd-steinberg" | "atkinson" | "bayer";

function clamp(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : n | 0;
}

function nearestInPalette(r: number, g: number, b: number, palette: RGB[]): RGB {
  let best = Infinity;
  let out = palette[0];
  const rgb: RGB = [clamp(r), clamp(g), clamp(b)];
  for (const p of palette) {
    const d = deltaE2000(rgb, p);
    if (d < best) {
      best = d;
      out = p;
    }
  }
  return out;
}

function buildCache(
  palette: RGB[],
  step: number,
): (r: number, g: number, b: number) => RGB {
  const size = Math.ceil(256 / step);
  const cache = new Map<number, RGB>();
  return (r, g, b) => {
    const rq = Math.min(size - 1, Math.floor(r / step));
    const gq = Math.min(size - 1, Math.floor(g / step));
    const bq = Math.min(size - 1, Math.floor(b / step));
    const key = rq * size * size + gq * size + bq;
    let hit = cache.get(key);
    if (!hit) {
      hit = nearestInPalette(rq * step, gq * step, bq * step, palette);
      cache.set(key, hit);
    }
    return hit;
  };
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export type SnapOptions = {
  dither: DitherMode;
  onProgress?: (p: number) => void;
};

export function snapToPalette(
  source: ImageData,
  palette: RGB[],
  options: SnapOptions,
): ImageData {
  const w = source.width;
  const h = source.height;
  const src = source.data;
  const out = new Uint8ClampedArray(src.length);
  out.set(src);
  const findExact = (r: number, g: number, b: number) => nearestInPalette(r, g, b, palette);
  const findFast = buildCache(palette, 8);
  const progress = options.onProgress;
  const mode = options.dither;

  if (mode === "none") {
    for (let i = 0; i < out.length; i += 4) {
      const nearest = findFast(out[i], out[i + 1], out[i + 2]);
      out[i] = nearest[0];
      out[i + 1] = nearest[1];
      out[i + 2] = nearest[2];
      if (progress && (i & 0xffff) === 0) progress(i / out.length);
    }
  } else if (mode === "floyd-steinberg") {
    const buf = new Float32Array(w * h * 3);
    for (let i = 0, j = 0; i < src.length; i += 4, j += 3) {
      buf[j] = src[i];
      buf[j + 1] = src[i + 1];
      buf[j + 2] = src[i + 2];
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 3;
        const or = buf[idx];
        const og = buf[idx + 1];
        const ob = buf[idx + 2];
        const nearest = findExact(or, og, ob);
        const pi = (y * w + x) * 4;
        out[pi] = nearest[0];
        out[pi + 1] = nearest[1];
        out[pi + 2] = nearest[2];
        const er = or - nearest[0];
        const eg = og - nearest[1];
        const eb = ob - nearest[2];
        pushError(buf, w, h, x + 1, y, er, eg, eb, 7 / 16);
        pushError(buf, w, h, x - 1, y + 1, er, eg, eb, 3 / 16);
        pushError(buf, w, h, x, y + 1, er, eg, eb, 5 / 16);
        pushError(buf, w, h, x + 1, y + 1, er, eg, eb, 1 / 16);
      }
      if (progress) progress(y / h);
    }
  } else if (mode === "atkinson") {
    const buf = new Float32Array(w * h * 3);
    for (let i = 0, j = 0; i < src.length; i += 4, j += 3) {
      buf[j] = src[i];
      buf[j + 1] = src[i + 1];
      buf[j + 2] = src[i + 2];
    }
    const weight = 1 / 8;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 3;
        const or = buf[idx];
        const og = buf[idx + 1];
        const ob = buf[idx + 2];
        const nearest = findExact(or, og, ob);
        const pi = (y * w + x) * 4;
        out[pi] = nearest[0];
        out[pi + 1] = nearest[1];
        out[pi + 2] = nearest[2];
        const er = or - nearest[0];
        const eg = og - nearest[1];
        const eb = ob - nearest[2];
        pushError(buf, w, h, x + 1, y, er, eg, eb, weight);
        pushError(buf, w, h, x + 2, y, er, eg, eb, weight);
        pushError(buf, w, h, x - 1, y + 1, er, eg, eb, weight);
        pushError(buf, w, h, x, y + 1, er, eg, eb, weight);
        pushError(buf, w, h, x + 1, y + 1, er, eg, eb, weight);
        pushError(buf, w, h, x, y + 2, er, eg, eb, weight);
      }
      if (progress) progress(y / h);
    }
  } else if (mode === "bayer") {
    const strength = 24;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pi = (y * w + x) * 4;
        const bias = (BAYER_4X4[y & 3][x & 3] / 16 - 0.5) * strength;
        const nearest = findExact(
          src[pi] + bias,
          src[pi + 1] + bias,
          src[pi + 2] + bias,
        );
        out[pi] = nearest[0];
        out[pi + 1] = nearest[1];
        out[pi + 2] = nearest[2];
      }
      if (progress) progress(y / h);
    }
  }

  return new ImageData(out, w, h);
}

function pushError(
  buf: Float32Array,
  w: number,
  h: number,
  x: number,
  y: number,
  er: number,
  eg: number,
  eb: number,
  f: number,
): void {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const idx = (y * w + x) * 3;
  buf[idx] += er * f;
  buf[idx + 1] += eg * f;
  buf[idx + 2] += eb * f;
}
