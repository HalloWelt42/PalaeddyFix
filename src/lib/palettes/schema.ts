import type { RGB } from "../analysis/convert";

export type Palette = {
  id: string;
  name: string;
  author?: string;
  description?: string;
  colors: RGB[];
  infoTopic?: string;
};

export type PaletteMatch = {
  palette: Palette;
  averageDistance: number;
  coverage: number;
  usedColors: number;
  weightedDistance: number;
};
