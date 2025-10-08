export type ImageMetadata = {
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

export async function extractMetadata(blob: Blob): Promise<ImageMetadata> {
  const buf = await blob.slice(0, Math.min(blob.size, 256 * 1024)).arrayBuffer();
  const view = new DataView(buf);
  const u8 = new Uint8Array(buf);

  if (u8.length >= 8 && isPngSignature(u8)) {
    return parsePng(view, u8);
  }
  if (u8.length >= 3 && u8[0] === 0xff && u8[1] === 0xd8) {
    return parseJpeg(view, u8);
  }
  if (u8.length >= 12 && isWebp(u8)) {
    return parseWebp(view, u8);
  }
  if (u8.length >= 6 && (isGif(u8))) {
    return parseGif(view, u8);
  }
  return {};
}

function isPngSignature(u8: Uint8Array): boolean {
  return u8[0] === 137 && u8[1] === 80 && u8[2] === 78 && u8[3] === 71 &&
    u8[4] === 13 && u8[5] === 10 && u8[6] === 26 && u8[7] === 10;
}

function isWebp(u8: Uint8Array): boolean {
  return u8[0] === 0x52 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x46 &&
    u8[8] === 0x57 && u8[9] === 0x45 && u8[10] === 0x42 && u8[11] === 0x50;
}

function isGif(u8: Uint8Array): boolean {
  return u8[0] === 0x47 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x38;
}

function parsePng(view: DataView, u8: Uint8Array): ImageMetadata {
  const meta: ImageMetadata = { format: "PNG" };
  let offset = 8;
  while (offset + 8 <= u8.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(u8[offset + 4], u8[offset + 5], u8[offset + 6], u8[offset + 7]);
    const dataStart = offset + 8;
    if (dataStart + length > u8.length) break;
    if (type === "IHDR") {
      const bitDepth = u8[dataStart + 8];
      const colorType = u8[dataStart + 9];
      meta.bitDepth = bitDepth;
      if (colorType === 0) meta.channels = "gray";
      else if (colorType === 2) meta.channels = "rgb";
      else if (colorType === 3) meta.channels = "indexed";
      else if (colorType === 4) meta.channels = "gray-alpha";
      else if (colorType === 6) meta.channels = "rgba";
      meta.hasAlpha = colorType === 4 || colorType === 6;
    } else if (type === "pHYs") {
      const ppuX = view.getUint32(dataStart);
      const ppuY = view.getUint32(dataStart + 4);
      const unit = u8[dataStart + 8];
      if (unit === 1) {
        meta.dpiX = Math.round(ppuX * 0.0254);
        meta.dpiY = Math.round(ppuY * 0.0254);
      }
    } else if (type === "iCCP" || type === "sRGB") {
      meta.colorProfile = type === "sRGB" ? "sRGB" : "ICC-Profil";
    } else if (type === "tRNS") {
      meta.hasAlpha = true;
    } else if (type === "tEXt" || type === "iTXt") {
      const kv = readPngText(u8, dataStart, length, type === "iTXt");
      if (kv && kv.key === "Software") meta.software = kv.value;
    } else if (type === "IDAT" || type === "IEND") {
      break;
    }
    offset = dataStart + length + 4;
  }
  return meta;
}

function readPngText(
  u8: Uint8Array,
  start: number,
  length: number,
  international: boolean,
): { key: string; value: string } | null {
  let i = start;
  const end = start + length;
  while (i < end && u8[i] !== 0) i++;
  const key = bytesToAscii(u8, start, i);
  let v = i + 1;
  if (international) {
    v += 1 + 1;
    while (v < end && u8[v] !== 0) v++;
    v++;
    while (v < end && u8[v] !== 0) v++;
    v++;
  }
  const value = bytesToUtf8(u8, v, end);
  return { key, value };
}

function bytesToAscii(u8: Uint8Array, from: number, to: number): string {
  let s = "";
  for (let i = from; i < to; i++) s += String.fromCharCode(u8[i]);
  return s;
}

function bytesToUtf8(u8: Uint8Array, from: number, to: number): string {
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(u8.slice(from, to));
  } catch {
    return bytesToAscii(u8, from, to);
  }
}

function parseJpeg(view: DataView, u8: Uint8Array): ImageMetadata {
  const meta: ImageMetadata = { format: "JPEG" };
  let i = 2;
  while (i + 4 < u8.length) {
    if (u8[i] !== 0xff) break;
    const marker = u8[i + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      i += 2;
      continue;
    }
    const len = view.getUint16(i + 2);
    const segStart = i + 4;
    const segEnd = i + 2 + len;
    if (segEnd > u8.length) break;
    if (marker === 0xe0 && len >= 16 && u8[segStart] === 0x4a && u8[segStart + 1] === 0x46) {
      const units = u8[segStart + 7];
      const xDensity = view.getUint16(segStart + 8);
      const yDensity = view.getUint16(segStart + 10);
      if (units === 1) {
        meta.dpiX = xDensity;
        meta.dpiY = yDensity;
      } else if (units === 2) {
        meta.dpiX = Math.round(xDensity * 2.54);
        meta.dpiY = Math.round(yDensity * 2.54);
      }
    } else if (marker === 0xe1 && len >= 14) {
      const isExif = u8[segStart] === 0x45 && u8[segStart + 1] === 0x78 &&
        u8[segStart + 2] === 0x69 && u8[segStart + 3] === 0x66;
      if (isExif) {
        const exif = parseExif(view, u8, segStart + 6);
        if (exif.camera) meta.camera = exif.camera;
        if (exif.software && !meta.software) meta.software = exif.software;
        if (exif.createdRaw) meta.createdRaw = exif.createdRaw;
        if (exif.colorProfile && !meta.colorProfile) meta.colorProfile = exif.colorProfile;
      }
    } else if (marker === 0xe2 && len >= 14) {
      const tag = bytesToAscii(u8, segStart, segStart + 11);
      if (tag.startsWith("ICC_PROFILE")) meta.colorProfile = "ICC-Profil";
    } else if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xcf && marker !== 0xc8)) {
      meta.bitDepth = u8[segStart];
      const components = u8[segStart + 5];
      if (components === 1) meta.channels = "gray";
      else if (components === 3) meta.channels = "rgb";
      else if (components === 4) meta.channels = "rgba";
      meta.hasAlpha = components === 4;
    }
    i = segEnd;
  }
  if (!meta.colorProfile) meta.colorProfile = "JFIF";
  return meta;
}

function parseExif(
  _view: DataView,
  u8: Uint8Array,
  tiffStart: number,
): { camera?: string; software?: string; createdRaw?: string; colorProfile?: string } {
  const result: { camera?: string; software?: string; createdRaw?: string; colorProfile?: string } = {};
  if (tiffStart + 8 > u8.length) return result;
  const littleEndian = u8[tiffStart] === 0x49 && u8[tiffStart + 1] === 0x49;
  const tiffView = new DataView(u8.buffer, u8.byteOffset + tiffStart);
  const firstIfd = tiffView.getUint32(4, littleEndian);
  if (firstIfd < 8 || firstIfd + 2 > tiffView.byteLength) return result;
  const numEntries = tiffView.getUint16(firstIfd, littleEndian);
  let make = "";
  let model = "";
  for (let k = 0; k < numEntries; k++) {
    const entry = firstIfd + 2 + k * 12;
    if (entry + 12 > tiffView.byteLength) break;
    const tag = tiffView.getUint16(entry, littleEndian);
    const type = tiffView.getUint16(entry + 2, littleEndian);
    const count = tiffView.getUint32(entry + 4, littleEndian);
    if (type !== 2) continue;
    let dataOffset = entry + 8;
    if (count > 4) dataOffset = tiffView.getUint32(entry + 8, littleEndian);
    if (dataOffset + count > tiffView.byteLength) continue;
    const str = readExifString(tiffView, dataOffset, count);
    if (tag === 0x010f) make = str;
    else if (tag === 0x0110) model = str;
    else if (tag === 0x0131) result.software = str;
    else if (tag === 0x0132) result.createdRaw = str;
    else if (tag === 0xa001) result.colorProfile = "sRGB";
  }
  if (make && model) {
    result.camera = model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`.trim();
  } else if (model) {
    result.camera = model;
  } else if (make) {
    result.camera = make;
  }
  return result;
}

function readExifString(view: DataView, offset: number, count: number): string {
  const bytes: number[] = [];
  for (let i = 0; i < count; i++) {
    const b = view.getUint8(offset + i);
    if (b === 0) break;
    bytes.push(b);
  }
  return bytes.map((b) => String.fromCharCode(b)).join("").trim();
}

function parseWebp(view: DataView, u8: Uint8Array): ImageMetadata {
  const meta: ImageMetadata = { format: "WebP" };
  if (u8.length < 30) return meta;
  const chunk = bytesToAscii(u8, 12, 16);
  if (chunk === "VP8X") {
    const flags = u8[20];
    meta.hasAlpha = (flags & 0x10) !== 0;
    if (flags & 0x20) meta.colorProfile = "ICC-Profil";
    meta.channels = meta.hasAlpha ? "rgba" : "rgb";
    meta.bitDepth = 8;
  } else if (chunk === "VP8 ") {
    meta.channels = "rgb";
    meta.hasAlpha = false;
    meta.bitDepth = 8;
  } else if (chunk === "VP8L") {
    const signature = u8[20];
    if (signature === 0x2f) {
      const alphaFlag = (u8[24] & 0x10) !== 0;
      meta.hasAlpha = alphaFlag;
      meta.channels = alphaFlag ? "rgba" : "rgb";
    }
    meta.bitDepth = 8;
  }
  return meta;
}

function parseGif(_view: DataView, u8: Uint8Array): ImageMetadata {
  const meta: ImageMetadata = { format: "GIF" };
  const packed = u8[10];
  const gctSize = 2 << (packed & 0x07);
  meta.bitDepth = ((packed >> 4) & 0x07) + 1;
  meta.channels = "indexed";
  void gctSize;
  return meta;
}
