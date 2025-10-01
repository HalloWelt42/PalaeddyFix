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
    const { blob, colorCount, downscaleTo, alpha } = req.payload;

    const { pixels, width, height } = await blobToPixels(blob, downscaleTo, alpha);
    post({ id: req.id, type: "progress", progress: 0.25 });

    const quantized = medianCut(pixels, colorCount, (p) => {
      post({ id: req.id, type: "progress", progress: 0.25 + p * 0.7 });
    });
    post({ id: req.id, type: "progress", progress: 0.98 });

    const total = pixels.length || 1;
    const colors: PaletteColor[] = quantized.map((q) => ({
      rgb: q.rgb,
      hex: rgbToHex(q.rgb),
      count: q.count,
      percent: (q.count / total) * 100,
    }));

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
