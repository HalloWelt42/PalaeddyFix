import { analysisKey, getAnalysis, getImage, putAnalysis } from "../storage/db";
import type { PaletteColor } from "../storage/schema";
import { runAnalysis, type AnalysisOutcome } from "../analysis/runAnalysis";
import { settings } from "./settings.svelte";

export const RARE_COLOR_COUNT = 256;

class AnalysisStore {
  colors = $state<PaletteColor[]>([]);
  totalPixels = $state<number>(0);
  analyzedWidth = $state<number>(0);
  analyzedHeight = $state<number>(0);
  running = $state<boolean>(false);
  progress = $state<number>(0);
  error = $state<string | null>(null);
  colorCount = $state<number>(settings.state.defaultColorCount);
  cached = $state<boolean>(false);
  imageId = $state<string | null>(null);

  rareColors = $state<PaletteColor[]>([]);
  rareRunning = $state<boolean>(false);
  rareProgress = $state<number>(0);
  rareCached = $state<boolean>(false);
  rareColorCount = $state<number>(RARE_COLOR_COUNT);

  setRareColorCount(n: number): void {
    this.rareColorCount = Math.max(8, Math.min(256, Math.round(n)));
  }

  clear(): void {
    this.colors = [];
    this.totalPixels = 0;
    this.analyzedWidth = 0;
    this.analyzedHeight = 0;
    this.error = null;
    this.cached = false;
    this.imageId = null;
    this.rareColors = [];
    this.rareCached = false;
  }

  setColorCount(n: number): void {
    this.colorCount = Math.max(2, Math.min(256, Math.round(n)));
  }

  async loadCached(imageId: string): Promise<boolean> {
    this.imageId = imageId;
    const cached = await getAnalysis(imageId, this.colorCount);
    if (cached) {
      this.colors = cached.colors;
      this.totalPixels = cached.totalPixels;
      this.cached = true;
      this.error = null;
    } else {
      this.colors = [];
      this.totalPixels = 0;
      this.cached = false;
    }
    const rareCache = await getAnalysis(imageId, this.rareColorCount);
    if (rareCache) {
      this.rareColors = rareCache.colors;
      this.rareCached = true;
    } else {
      this.rareColors = [];
      this.rareCached = false;
    }
    return !!cached;
  }

  async loadRareCached(imageId: string): Promise<boolean> {
    const rareCache = await getAnalysis(imageId, this.rareColorCount);
    if (rareCache) {
      this.rareColors = rareCache.colors;
      this.rareCached = true;
      return true;
    }
    this.rareColors = [];
    this.rareCached = false;
    return false;
  }

  async analyze(imageId: string): Promise<void> {
    const img = await getImage(imageId);
    if (!img) return;
    this.running = true;
    this.progress = 0;
    this.error = null;
    this.imageId = imageId;
    try {
      const outcome: AnalysisOutcome = await runAnalysis({
        blob: img.blob,
        colorCount: this.colorCount,
        downscaleTo: settings.state.downscaleTo,
        alpha: settings.state.alpha,
        onProgress: (p) => {
          this.progress = p;
        },
      });
      this.colors = outcome.colors;
      this.totalPixels = outcome.totalPixels;
      this.analyzedWidth = outcome.width;
      this.analyzedHeight = outcome.height;
      this.cached = false;

      await putAnalysis({
        key: analysisKey(imageId, this.colorCount),
        imageId,
        colorCount: this.colorCount,
        algorithm: "median-cut",
        downscaleTo: settings.state.downscaleTo,
        alpha: settings.state.alpha,
        totalPixels: outcome.totalPixels,
        colors: outcome.colors,
        createdAt: Date.now(),
      });
    } catch (err) {
      this.error = err instanceof Error ? err.message : String(err);
    } finally {
      this.running = false;
      this.progress = 0;
    }
  }

  async analyzeRare(imageId: string): Promise<void> {
    const img = await getImage(imageId);
    if (!img) return;
    const targetCount = this.rareColorCount;
    this.rareRunning = true;
    this.rareProgress = 0;
    this.error = null;
    this.imageId = imageId;
    try {
      const outcome: AnalysisOutcome = await runAnalysis({
        blob: img.blob,
        colorCount: targetCount,
        downscaleTo: settings.state.downscaleTo,
        alpha: settings.state.alpha,
        onProgress: (p) => {
          this.rareProgress = p;
        },
      });
      this.rareColors = outcome.colors;
      this.totalPixels = outcome.totalPixels;
      this.analyzedWidth = outcome.width;
      this.analyzedHeight = outcome.height;
      this.rareCached = false;

      await putAnalysis({
        key: analysisKey(imageId, targetCount),
        imageId,
        colorCount: targetCount,
        algorithm: "median-cut",
        downscaleTo: settings.state.downscaleTo,
        alpha: settings.state.alpha,
        totalPixels: outcome.totalPixels,
        colors: outcome.colors,
        createdAt: Date.now(),
      });
    } catch (err) {
      this.error = err instanceof Error ? err.message : String(err);
    } finally {
      this.rareRunning = false;
      this.rareProgress = 0;
    }
  }
}

export const analysis = new AnalysisStore();
