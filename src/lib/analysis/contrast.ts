import type { RGB } from "./convert";

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance([r, g, b]: RGB): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la >= lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "AA-Large" | "UI" | "Fail";

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-Large";
  if (ratio >= 1.5) return "UI";
  return "Fail";
}

export function wcagLabel(level: WcagLevel): string {
  switch (level) {
    case "AAA": return "AAA";
    case "AA": return "AA";
    case "AA-Large": return "AA Large";
    case "UI": return "UI";
    case "Fail": return "—";
  }
}
