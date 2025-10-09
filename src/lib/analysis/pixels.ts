import type { AlphaMode } from "../storage/schema";
import type { Pixel } from "./quantize";

export type PixelsRegion = { x: number; y: number; w: number; h: number };

export type PixelsResult = {
  pixels: Pixel[];
  alphas?: number[];
  width: number;
  height: number;
};

export async function blobToPixels(
  blob: Blob,
  downscaleTo: number,
  alpha: AlphaMode,
  region?: PixelsRegion | null,
): Promise<PixelsResult> {
  const bitmap = await createImageBitmap(blob);
  try {
    const sx = region ? Math.max(0, Math.floor(region.x)) : 0;
    const sy = region ? Math.max(0, Math.floor(region.y)) : 0;
    const sw = region
      ? Math.max(1, Math.min(bitmap.width - sx, Math.floor(region.w)))
      : bitmap.width;
    const sh = region
      ? Math.max(1, Math.min(bitmap.height - sy, Math.floor(region.h)))
      : bitmap.height;
    const scale = Math.min(1, downscaleTo / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));

    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(w, h)
        : Object.assign(document.createElement("canvas"), { width: w, height: h });
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D nicht verfügbar");
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h).data;
    const pixels: Pixel[] = [];
    const alphas: number[] = [];
    const keepAlpha = alpha === "keep";
    const ignoreAlpha = alpha === "ignore";
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (ignoreAlpha && a < 8) continue;
      if (keepAlpha) {
        if (a < 8) continue;
        pixels.push([data[i], data[i + 1], data[i + 2]]);
        alphas.push(a);
      } else if (ignoreAlpha) {
        pixels.push([data[i], data[i + 1], data[i + 2]]);
      } else {
        const f = a / 255;
        pixels.push([
          Math.round(data[i] * f),
          Math.round(data[i + 1] * f),
          Math.round(data[i + 2] * f),
        ]);
      }
    }
    return keepAlpha ? { pixels, alphas, width: w, height: h } : { pixels, width: w, height: h };
  } finally {
    bitmap.close();
  }
}
