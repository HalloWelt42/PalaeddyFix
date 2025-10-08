export type ImageMetaInfo = {
  format?: string;
  bitDepth?: number;
  channels?: "gray" | "gray-alpha" | "rgb" | "rgba" | "indexed";
  hasAlpha?: boolean;
  dpiX?: number;
  dpiY?: number;
  colorProfile?: string;
  camera?: string;
  software?: string;
  createdRaw?: string;
};

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
  meta?: ImageMetaInfo;
};

export type ImageListItem = Omit<StoredImage, "blob" | "thumbBlob"> & {
  thumbUrl: string;
};

export type PaletteColor = {
  rgb: [number, number, number];
  hex: string;
  count: number;
  percent: number;
  alpha?: number;
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

export type AlphaMode = "ignore" | "factor" | "keep";
export type ThemeMode = "dark" | "light" | "system";
export type CopyFormat = "hex" | "rgb" | "hsl" | "oklch" | "named";

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

export type PaletteSource =
  | "analysis-frequent"
  | "analysis-rare"
  | "manual"
  | "snapshot";

export type StoredPalette = {
  id: string;
  name: string;
  source: PaletteSource;
  sourceImageId?: string;
  colors: Array<[number, number, number]>;
  createdAt: number;
  pinned: boolean;
  note?: string;
};
