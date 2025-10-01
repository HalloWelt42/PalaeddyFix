export type StoredImage = {
  id: string;
  name: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  createdAt: number;
  pinned: boolean;
  blob: Blob;
  thumbBlob?: Blob;
  tags?: string[];
  note?: string;
};

export type ImageListItem = Omit<StoredImage, "blob" | "thumbBlob"> & {
  thumbUrl: string;
};

export type PaletteColor = {
  rgb: [number, number, number];
  hex: string;
  count: number;
  percent: number;
};

export type AnalysisResult = {
  key: string;
  imageId: string;
  colorCount: number;
  algorithm: "median-cut";
  downscaleTo: number;
  alpha: AlphaMode;
  totalPixels: number;
  colors: PaletteColor[];
  createdAt: number;
};

export type AlphaMode = "ignore" | "factor";
export type ThemeMode = "dark" | "light" | "system";
export type CopyFormat = "hex" | "rgb" | "hsl" | "oklch";

export type Settings = {
  theme: ThemeMode;
  alpha: AlphaMode;
  downscaleTo: number;
  defaultColorCount: number;
  copyFormat: CopyFormat;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  alpha: "ignore",
  downscaleTo: 1024,
  defaultColorCount: 16,
  copyFormat: "hex",
};
