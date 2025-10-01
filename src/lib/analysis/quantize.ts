export type Pixel = [number, number, number];

type Box = {
  pixels: Pixel[];
  rMin: number;
  rMax: number;
  gMin: number;
  gMax: number;
  bMin: number;
  bMax: number;
};

function boxFromPixels(pixels: Pixel[]): Box {
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
  for (const [r, g, b] of pixels) {
    if (r < rMin) rMin = r;
    if (r > rMax) rMax = r;
    if (g < gMin) gMin = g;
    if (g > gMax) gMax = g;
    if (b < bMin) bMin = b;
    if (b > bMax) bMax = b;
  }
  return { pixels, rMin, rMax, gMin, gMax, bMin, bMax };
}

function longestAxis(box: Box): 0 | 1 | 2 {
  const rr = box.rMax - box.rMin;
  const gr = box.gMax - box.gMin;
  const br = box.bMax - box.bMin;
  if (rr >= gr && rr >= br) return 0;
  if (gr >= br) return 1;
  return 2;
}

function axisRange(box: Box, axis: 0 | 1 | 2): number {
  if (axis === 0) return box.rMax - box.rMin;
  if (axis === 1) return box.gMax - box.gMin;
  return box.bMax - box.bMin;
}

function splitBox(box: Box): [Box, Box] | null {
  if (box.pixels.length < 2) return null;
  const axis = longestAxis(box);
  if (axisRange(box, axis) === 0) return null;
  const sorted = [...box.pixels].sort((a, b) => a[axis] - b[axis]);
  const mid = sorted.length >> 1;
  const left = sorted.slice(0, mid);
  const right = sorted.slice(mid);
  if (left.length === 0 || right.length === 0) return null;
  return [boxFromPixels(left), boxFromPixels(right)];
}

function averageColor(pixels: Pixel[]): Pixel {
  let r = 0, g = 0, b = 0;
  for (const [pr, pg, pb] of pixels) {
    r += pr;
    g += pg;
    b += pb;
  }
  const n = pixels.length;
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

export type QuantResult = {
  rgb: Pixel;
  count: number;
};

export function medianCut(
  pixels: Pixel[],
  targetCount: number,
  onProgress?: (progress: number) => void,
): QuantResult[] {
  if (pixels.length === 0) return [];
  const target = Math.max(1, Math.min(256, Math.floor(targetCount)));
  const boxes: Box[] = [boxFromPixels(pixels)];

  if (onProgress) onProgress(boxes.length / target);
  while (boxes.length < target) {
    let bestIdx = -1;
    let bestScore = -1;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (b.pixels.length < 2) continue;
      const axis = longestAxis(b);
      const score = axisRange(b, axis) * Math.sqrt(b.pixels.length);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    const split = splitBox(boxes[bestIdx]);
    if (!split) break;
    boxes.splice(bestIdx, 1, split[0], split[1]);
    if (onProgress) onProgress(boxes.length / target);
  }

  const out: QuantResult[] = boxes.map((b) => ({
    rgb: averageColor(b.pixels),
    count: b.pixels.length,
  }));
  out.sort((a, b) => b.count - a.count);
  return out;
}
