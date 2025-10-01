import type { AlphaMode } from "../storage/schema";
import type { Pixel } from "./quantize";

export type PixelsResult = {
  pixels: Pixel[];
  width: number;
  height: number;
};

export async function blobToPixels(
  blob: Blob,
  downscaleTo: number,
  alpha: AlphaMode,
): Promise<PixelsResult> {
  const bitmap = await createImageBitmap(blob);
  try {
    const w0 = bitmap.width;
    const h0 = bitmap.height;
    const scale = Math.min(1, downscaleTo / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));

    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(w, h)
        : Object.assign(document.createElement("canvas"), { width: w, height: h });
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D nicht verfügbar");
    ctx.drawImage(bitmap, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h).data;
    const pixels: Pixel[] = [];
    const ignoreAlpha = alpha === "ignore";
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (ignoreAlpha && a < 8) continue;
      if (ignoreAlpha) {
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
    return { pixels, width: w, height: h };
  } finally {
    bitmap.close();
  }
}
