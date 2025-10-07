export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export type HSL = [number, number, number];
export type OKLCH = [number, number, number];
export type OKLab = [number, number, number];

export function rgbToHex([r, g, b]: RGB): string {
  const h = (n: number): string => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function hexToRgb(hex: string): RGB | null {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function rgbToHsl([r, g, b]: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0));
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function rgbToOklab([r, g, b]: RGB): OKLab {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

export function rgbToOklch(rgb: RGB): OKLCH {
  const [L, a, b] = rgbToOklab(rgb);
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

export type CopyFormat = "hex" | "rgb" | "hsl" | "oklch";

export function formatRgb(rgb: RGB): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function formatHsl(rgb: RGB): string {
  const [h, s, l] = rgbToHsl(rgb);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function formatOklch(rgb: RGB): string {
  const [L, C, H] = rgbToOklch(rgb);
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

export function formatColor(rgb: RGB, fmt: CopyFormat): string {
  switch (fmt) {
    case "hex":
      return rgbToHex(rgb);
    case "rgb":
      return formatRgb(rgb);
    case "hsl":
      return formatHsl(rgb);
    case "oklch":
      return formatOklch(rgb);
  }
}

export function isLight(rgb: RGB): boolean {
  const [r, g, b] = rgb;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 140;
}

export function rgbaToHex8([r, g, b, a]: RGBA): string {
  const h = (n: number): string => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}${h(a)}`;
}

export function formatRgba([r, g, b, a]: RGBA): string {
  const alpha = (a / 255).toFixed(3).replace(/\.?0+$/, "") || "0";
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatHsla(rgb: RGB, alpha: number): string {
  const [h, s, l] = rgbToHsl(rgb);
  const a = (alpha / 255).toFixed(3).replace(/\.?0+$/, "") || "0";
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export function formatOklchA(rgb: RGB, alpha: number): string {
  const [L, C, H] = rgbToOklch(rgb);
  const a = (alpha / 255).toFixed(3).replace(/\.?0+$/, "") || "0";
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)} / ${a})`;
}

export function hasAlpha(a: number | undefined): boolean {
  return typeof a === "number" && a < 255;
}

export function formatColorA(rgb: RGB, alpha: number, fmt: CopyFormat): string {
  if (!hasAlpha(alpha)) return formatColor(rgb, fmt);
  const rgba: RGBA = [rgb[0], rgb[1], rgb[2], alpha];
  switch (fmt) {
    case "hex":
      return rgbaToHex8(rgba);
    case "rgb":
      return formatRgba(rgba);
    case "hsl":
      return formatHsla(rgb, alpha);
    case "oklch":
      return formatOklchA(rgb, alpha);
  }
}
