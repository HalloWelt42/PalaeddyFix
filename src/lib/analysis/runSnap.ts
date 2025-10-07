import SnapWorker from "./snap.worker?worker";
import type { RGB } from "./convert";
import type { DitherMode } from "./snap";
import type { SnapRequest, SnapResponse } from "./snap.worker";

type PendingEntry = {
  resolve: (value: SnapOutcome) => void;
  reject: (err: Error) => void;
  onProgress?: (progress: number) => void;
};

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, PendingEntry>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new SnapWorker();
  worker.addEventListener("message", (e: MessageEvent<SnapResponse>) => {
    const entry = pending.get(e.data.id);
    if (!entry) return;
    if (e.data.type === "progress") {
      entry.onProgress?.(e.data.progress);
      return;
    }
    pending.delete(e.data.id);
    if (e.data.type === "result") {
      entry.resolve({
        width: e.data.width,
        height: e.data.height,
        pixels: new Uint8ClampedArray(e.data.buffer),
      });
    } else {
      entry.reject(new Error(e.data.error));
    }
  });
  worker.addEventListener("error", (e: ErrorEvent) => {
    console.error("Snap-Worker-Fehler", e);
  });
  return worker;
}

export type SnapParams = {
  blob: Blob;
  palette: RGB[];
  dither: DitherMode;
  maxEdge: number;
  onProgress?: (progress: number) => void;
};

export type SnapOutcome = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
};

export function runSnap(params: SnapParams): Promise<SnapOutcome> {
  const id = nextId++;
  const paletteCopy: RGB[] = params.palette.map(
    (rgb): RGB => [rgb[0], rgb[1], rgb[2]],
  );
  return new Promise<SnapOutcome>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress: params.onProgress });
    const req: SnapRequest = {
      id,
      type: "snap",
      payload: {
        blob: params.blob,
        palette: paletteCopy,
        dither: params.dither,
        maxEdge: params.maxEdge,
      },
    };
    getWorker().postMessage(req);
  });
}
