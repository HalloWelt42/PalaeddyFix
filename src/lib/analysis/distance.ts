import { rgbToOklab, type OKLab, type RGB } from "./convert";

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

function rad2deg(r: number): number {
  return (r * 180) / Math.PI;
}

function oklabToLab(oklab: OKLab): [number, number, number] {
  return [oklab[0] * 100, oklab[1] * 100, oklab[2] * 100];
}

export function deltaE2000(rgbA: RGB, rgbB: RGB): number {
  const labA = oklabToLab(rgbToOklab(rgbA));
  const labB = oklabToLab(rgbToOklab(rgbB));

  const [L1, a1, b1] = labA;
  const [L2, a2, b2] = labB;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = C1p === 0 ? 0 : ((rad2deg(Math.atan2(b1, a1p)) + 360) % 360);
  const h2p = C2p === 0 ? 0 : ((rad2deg(Math.atan2(b2, a2p)) + 360) % 360);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    const diff = h2p - h1p;
    if (Math.abs(diff) <= 180) dhp = diff;
    else if (diff > 180) dhp = diff - 360;
    else dhp = diff + 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deg2rad(dhp) / 2);

  const avgLp = (L1 + L2) / 2;
  const avgCp = (C1p + C2p) / 2;
  let avgHp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) avgHp = (h1p + h2p) / 2;
    else if (h1p + h2p < 360) avgHp = (h1p + h2p + 360) / 2;
    else avgHp = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(deg2rad(avgHp - 30)) +
    0.24 * Math.cos(deg2rad(2 * avgHp)) +
    0.32 * Math.cos(deg2rad(3 * avgHp + 6)) -
    0.2 * Math.cos(deg2rad(4 * avgHp - 63));

  const dTheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2));
  const Rc =
    2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const Sl =
    1 +
    (0.015 * Math.pow(avgLp - 50, 2)) /
      Math.sqrt(20 + Math.pow(avgLp - 50, 2));
  const Sc = 1 + 0.045 * avgCp;
  const Sh = 1 + 0.015 * avgCp * T;
  const Rt = -Math.sin(deg2rad(2 * dTheta)) * Rc;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const termL = dLp / (kL * Sl);
  const termC = dCp / (kC * Sc);
  const termH = dHp / (kH * Sh);

  return Math.sqrt(
    termL * termL + termC * termC + termH * termH + Rt * termC * termH,
  );
}

export function nearestPaletteColor(
  target: RGB,
  palette: RGB[],
): { index: number; distance: number } {
  let best = Infinity;
  let idx = 0;
  for (let i = 0; i < palette.length; i++) {
    const d = deltaE2000(target, palette[i]);
    if (d < best) {
      best = d;
      idx = i;
    }
  }
  return { index: idx, distance: best };
}
