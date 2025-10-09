import type { AlphaMode, PaletteColor } from "../storage/schema";
import { rgbToHex } from "./convert";
import { blobToPixels } from "./pixels";
import { medianCut } from "./quantize";

export type WorkerRequest = {
  id: number;
  type: "analyze";
  payload: {
    blob: Blob;
    colorCount: number;
    downscaleTo: number;
    alpha: AlphaMode;
    region?: { x: number; y: number; w: number; h: number } | null;
  };
};

export type WorkerResponse =
  | { id: number; type: "progress"; progress: number }
  | {
      id: number;
      type: "result";
      result: {
        colors: PaletteColor[];
        totalPixels: number;
        width: number;
        height: number;
      };
    }
  | { id: number; type: "error"; error: string };

function post(msg: WorkerResponse): void {
  (self as DedicatedWorkerGlobalScope).postMessage(msg);
}

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  if (req.type !== "analyze") return;

  try {
    post({ id: req.id, type: "progress", progress: 0.02 });
    const { blob, colorCount, downscaleTo, alpha, region } = req.payload;

    const { pixels, alphas, width, height } = await blobToPixels(blob, downscaleTo, alpha, region);
    post({ id: req.id, type: "progress", progress: 0.25 });

    const quantized = medianCut(pixels, colorCount, (p) => {
      post({ id: req.id, type: "progress", progress: 0.25 + p * 0.7 });
    });
    post({ id: req.id, type: "progress", progress: 0.98 });

    const total = pixels.length || 1;
    const merged = new Map<string, { rgb: typeof quantized[number]["rgb"]; count: number }>();
    for (const q of quantized) {
      const hex = rgbToHex(q.rgb);
      const existing = merged.get(hex);
      if (existing) existing.count += q.count;
      else merged.set(hex, { rgb: q.rgb, count: q.count });
    }
    const dedupedSorted = Array.from(merged.entries())
      .map(([hex, v]) => ({ hex, rgb: v.rgb, count: v.count }))
      .sort((a, b) => b.count - a.count);

    let alphaByIdx: number[] | null = null;
    if (alphas && dedupedSorted.length > 0) {
      const sums = new Float64Array(dedupedSorted.length);
      const counts = new Uint32Array(dedupedSorted.length);
      for (let i = 0; i < pixels.length; i++) {
        const [pr, pg, pb] = pixels[i];
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let j = 0; j < dedupedSorted.length; j++) {
          const [qr, qg, qb] = dedupedSorted[j].rgb;
          const dr = pr - qr;
          const dg = pg - qg;
          const db = pb - qb;
          const d = dr * dr + dg * dg + db * db;
          if (d < bestDist) {
            bestDist = d;
            bestIdx = j;
          }
        }
        sums[bestIdx] += alphas[i];
        counts[bestIdx]++;
      }
      alphaByIdx = [];
      for (let j = 0; j < dedupedSorted.length; j++) {
        alphaByIdx.push(counts[j] > 0 ? Math.round(sums[j] / counts[j]) : 255);
      }
    }

    const colors: PaletteColor[] = dedupedSorted.map((q, idx) => {
      const pc: PaletteColor = {
        rgb: q.rgb,
        hex: q.hex,
        count: q.count,
        percent: (q.count / total) * 100,
      };
      if (alphaByIdx) pc.alpha = alphaByIdx[idx];
      return pc;
    });

    post({
      id: req.id,
      type: "result",
      result: {
        colors,
        totalPixels: total,
        width,
        height,
      },
    });
  } catch (err) {
    post({
      id: req.id,
      type: "error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
