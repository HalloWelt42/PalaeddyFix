import { deltaE2000, nearestPaletteColor } from "../analysis/distance";
import type { PaletteColor } from "../storage/schema";
import type { Palette, PaletteMatch } from "./schema";

const EXCELLENT_DE = 4;
const PERFECT_DE = 2;

export function matchPalette(
  imageColors: PaletteColor[],
  palette: Palette,
): PaletteMatch {
  if (imageColors.length === 0 || palette.colors.length === 0) {
    return {
      palette,
      averageDistance: Infinity,
      coverage: 0,
      usedColors: 0,
      weightedDistance: Infinity,
    };
  }

  const used = new Set<number>();
  let weightSum = 0;
  let weightedDeltaSum = 0;
  let goodShare = 0;

  for (const color of imageColors) {
    const weight = color.percent;
    const nearest = nearestPaletteColor(color.rgb, palette.colors);
    used.add(nearest.index);
    weightSum += weight;
    weightedDeltaSum += nearest.distance * weight;
    if (nearest.distance <= EXCELLENT_DE) goodShare += weight;
  }

  const averageDistance = weightSum === 0 ? 0 : weightedDeltaSum / weightSum;
  const coverage = weightSum === 0 ? 0 : goodShare / weightSum;

  return {
    palette,
    averageDistance,
    coverage,
    usedColors: used.size,
    weightedDistance: averageDistance,
  };
}

export function matchAllPalettes(
  imageColors: PaletteColor[],
  palettes: Palette[],
): PaletteMatch[] {
  return palettes
    .map((p) => matchPalette(imageColors, p))
    .sort((a, b) => a.weightedDistance - b.weightedDistance);
}

export function perfectMatchIndices(
  palette: Palette,
  imageColors: PaletteColor[],
  threshold: number = PERFECT_DE,
): Set<number> {
  const indices = new Set<number>();
  for (let i = 0; i < palette.colors.length; i++) {
    const pc = palette.colors[i];
    for (const c of imageColors) {
      if (deltaE2000(pc, c.rgb) <= threshold) {
        indices.add(i);
        break;
      }
    }
  }
  return indices;
}
