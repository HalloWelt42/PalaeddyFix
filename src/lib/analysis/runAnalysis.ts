import AnalysisWorker from "./analysis.worker?worker";
import type { AlphaMode, PaletteColor } from "../storage/schema";
import type { WorkerRequest, WorkerResponse } from "./analysis.worker";

type PendingEntry = {
  resolve: (value: AnalysisOutcome) => void;
  reject: (err: Error) => void;
  onProgress?: (progress: number) => void;
};

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, PendingEntry>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new AnalysisWorker();
  worker.addEventListener("message", (e: MessageEvent<WorkerResponse>) => {
    const entry = pending.get(e.data.id);
    if (!entry) return;
    if (e.data.type === "progress") {
      entry.onProgress?.(e.data.progress);
      return;
    }
    pending.delete(e.data.id);
    if (e.data.type === "result") {
      entry.resolve(e.data.result);
    } else {
      entry.reject(new Error(e.data.error));
    }
  });
  worker.addEventListener("error", (e: ErrorEvent) => {
    console.error("Analyse-Worker-Fehler", e);
  });
  return worker;
}

export type AnalysisParams = {
  blob: Blob;
  colorCount: number;
  downscaleTo: number;
  alpha: AlphaMode;
  onProgress?: (progress: number) => void;
};

export type AnalysisOutcome = {
  colors: PaletteColor[];
  totalPixels: number;
  width: number;
  height: number;
};

export function runAnalysis(params: AnalysisParams): Promise<AnalysisOutcome> {
  const id = nextId++;
  return new Promise<AnalysisOutcome>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress: params.onProgress });
    const req: WorkerRequest = {
      id,
      type: "analyze",
      payload: {
        blob: params.blob,
        colorCount: params.colorCount,
        downscaleTo: params.downscaleTo,
        alpha: params.alpha,
      },
    };
    getWorker().postMessage(req);
  });
}
