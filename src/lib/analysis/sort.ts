import type { PaletteColor } from "../storage/schema";
import { rgbToOklch, rgbToHsl } from "./convert";

export type SortMode = "count" | "luminance" | "hue" | "chroma";

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "count", label: "Anteil" },
  { value: "luminance", label: "Hell" },
  { value: "hue", label: "Hue" },
  { value: "chroma", label: "Sätt." },
];

export function sortColors(colors: PaletteColor[], mode: SortMode): PaletteColor[] {
  const arr = colors.slice();
  if (mode === "count") {
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }
  if (mode === "luminance") {
    arr.sort((a, b) => {
      const la = 0.2126 * a.rgb[0] + 0.7152 * a.rgb[1] + 0.0722 * a.rgb[2];
      const lb = 0.2126 * b.rgb[0] + 0.7152 * b.rgb[1] + 0.0722 * b.rgb[2];
      return la - lb;
    });
    return arr;
  }
  if (mode === "hue") {
    arr.sort((a, b) => {
      const [, sa, la] = rgbToHsl(a.rgb);
      const [, sb, lb] = rgbToHsl(b.rgb);
      const [, ca, ha] = rgbToOklch(a.rgb);
      const [, cb, hb] = rgbToOklch(b.rgb);
      const aIsNeutral = sa < 5 || la < 5 || la > 95 || ca < 0.02;
      const bIsNeutral = sb < 5 || lb < 5 || lb > 95 || cb < 0.02;
      if (aIsNeutral && bIsNeutral) return la - lb;
      if (aIsNeutral) return 1;
      if (bIsNeutral) return -1;
      return ha - hb;
    });
    return arr;
  }
  if (mode === "chroma") {
    arr.sort((a, b) => {
      const [, ca] = rgbToOklch(a.rgb);
      const [, cb] = rgbToOklch(b.rgb);
      return cb - ca;
    });
    return arr;
  }
  return arr;
}
