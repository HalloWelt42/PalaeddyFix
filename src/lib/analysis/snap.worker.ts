import type { RGB } from "./convert";
import { snapToPalette, type DitherMode } from "./snap";

export type SnapRequest = {
  id: number;
  type: "snap";
  payload: {
    blob: Blob;
    palette: RGB[];
    dither: DitherMode;
    maxEdge: number;
  };
};

export type SnapResponse =
  | { id: number; type: "progress"; progress: number }
  | {
      id: number;
      type: "result";
      width: number;
      height: number;
      buffer: ArrayBuffer;
    }
  | { id: number; type: "error"; error: string };

function post(msg: SnapResponse, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    (self as DedicatedWorkerGlobalScope).postMessage(msg, transfer);
  } else {
    (self as DedicatedWorkerGlobalScope).postMessage(msg);
  }
}

self.addEventListener("message", async (event: MessageEvent<SnapRequest>) => {
  const req = event.data;
  if (req.type !== "snap") return;
  try {
    post({ id: req.id, type: "progress", progress: 0.05 });
    const bitmap = await createImageBitmap(req.payload.blob);
    const w0 = bitmap.width;
    const h0 = bitmap.height;
    const scale = Math.min(1, req.payload.maxEdge / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D nicht verfügbar");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const src = ctx.getImageData(0, 0, w, h);
    post({ id: req.id, type: "progress", progress: 0.15 });

    const out = snapToPalette(src, req.payload.palette, {
      dither: req.payload.dither,
      onProgress: (p) => {
        post({ id: req.id, type: "progress", progress: 0.15 + p * 0.8 });
      },
    });

    const buffer = out.data.buffer;
    post(
      {
        id: req.id,
        type: "result",
        width: out.width,
        height: out.height,
        buffer,
      },
      [buffer],
    );
  } catch (err) {
    post({
      id: req.id,
      type: "error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
