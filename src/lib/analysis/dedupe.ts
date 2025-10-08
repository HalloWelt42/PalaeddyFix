import type { PaletteColor } from "../storage/schema";
import { rgbToHex } from "./convert";
import { deltaE2000 } from "./distance";

export function dedupePerceptually(
  colors: PaletteColor[],
  threshold: number = 3,
): PaletteColor[] {
  type Cluster = {
    rSum: number;
    gSum: number;
    bSum: number;
    members: number;
    totalCount: number;
  };
  const clusters: Cluster[] = [];
  for (const c of colors) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      const cl = clusters[i];
      const avg: [number, number, number] = [
        Math.round(cl.rSum / cl.members),
        Math.round(cl.gSum / cl.members),
        Math.round(cl.bSum / cl.members),
      ];
      const d = deltaE2000(c.rgb, avg);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestDist <= threshold && bestIdx >= 0) {
      const cl = clusters[bestIdx];
      cl.rSum += c.rgb[0];
      cl.gSum += c.rgb[1];
      cl.bSum += c.rgb[2];
      cl.members += 1;
      cl.totalCount += c.count;
    } else {
      clusters.push({
        rSum: c.rgb[0],
        gSum: c.rgb[1],
        bSum: c.rgb[2],
        members: 1,
        totalCount: c.count,
      });
    }
  }
  const totalCount = clusters.reduce((s, cl) => s + cl.totalCount, 0) || 1;
  return clusters
    .map((cl) => {
      const rgb: [number, number, number] = [
        Math.round(cl.rSum / cl.members),
        Math.round(cl.gSum / cl.members),
        Math.round(cl.bSum / cl.members),
      ];
      return {
        rgb,
        hex: rgbToHex(rgb),
        count: cl.totalCount,
        percent: (cl.totalCount / totalCount) * 100,
      };
    })
    .sort((a, b) => b.count - a.count);
}
