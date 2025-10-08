export type Zone = {
  x: number;
  y: number;
  rgb: [number, number, number];
  alpha: number;
};

export async function computeZones(blob: Blob, gridSize: number): Promise<Zone[]> {
  const bitmap = await createImageBitmap(blob);
  try {
    const g = Math.max(2, Math.min(32, Math.floor(gridSize)));
    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(g, g)
        : Object.assign(document.createElement("canvas"), { width: g, height: g });
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D nicht verfügbar");
    ctx.clearRect(0, 0, g, g);
    ctx.drawImage(bitmap, 0, 0, g, g);
    const data = ctx.getImageData(0, 0, g, g).data;
    const zones: Zone[] = [];
    for (let y = 0; y < g; y++) {
      for (let x = 0; x < g; x++) {
        const i = (y * g + x) * 4;
        zones.push({
          x,
          y,
          rgb: [data[i], data[i + 1], data[i + 2]],
          alpha: data[i + 3],
        });
      }
    }
    return zones;
  } finally {
    bitmap.close();
  }
}
