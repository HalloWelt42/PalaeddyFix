import { deltaE2000 } from "./distance";
import type { PaletteColor } from "../storage/schema";

/**
 * Farthest-Point-Sampling auf einer Farb-Liste.
 * Liefert eine Teilmenge, die perzeptiv maximal voneinander verschieden ist.
 */
export function pickDistinctColors(
  pool: PaletteColor[],
  target: number,
): PaletteColor[] {
  const n = pool.length;
  if (n === 0) return [];
  const count = Math.max(1, Math.min(target, n));
  const taken = new Set<number>([0]);
  const selected: PaletteColor[] = [pool[0]];

  while (selected.length < count) {
    let bestIdx = -1;
    let bestMin = -1;
    for (let i = 0; i < n; i++) {
      if (taken.has(i)) continue;
      let minD = Infinity;
      for (const s of selected) {
        const d = deltaE2000(pool[i].rgb, s.rgb);
        if (d < minD) minD = d;
      }
      if (minD > bestMin) {
        bestMin = minD;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    taken.add(bestIdx);
    selected.push(pool[bestIdx]);
  }
  return selected;
}
