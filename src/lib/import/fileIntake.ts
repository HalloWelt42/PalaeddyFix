import type { StoredImage } from "../storage/schema";

const ACCEPTED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
]);

export function isAcceptedImage(mime: string): boolean {
  return ACCEPTED_MIME.has(mime.toLowerCase());
}

export async function ingestFile(file: File): Promise<StoredImage> {
  if (!isAcceptedImage(file.type)) {
    throw new Error(`Nicht unterstützter Dateityp: ${file.type || "unbekannt"}`);
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const thumbBlob = await makeThumb(img);
    return {
      id: cryptoRandomId(),
      name: file.name || "clipboard.png",
      mime: file.type || "image/png",
      size: file.size,
      width: img.naturalWidth,
      height: img.naturalHeight,
      createdAt: Date.now(),
      pinned: false,
      blob: file,
      thumbBlob,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function ingestFiles(files: FileList | File[]): Promise<StoredImage[]> {
  const arr = Array.from(files).filter((f) => isAcceptedImage(f.type));
  const results: StoredImage[] = [];
  for (const f of arr) {
    try {
      results.push(await ingestFile(f));
    } catch (err) {
      console.warn("Intake fehlgeschlagen:", f.name, err);
    }
  }
  return results;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht dekodiert werden"));
    img.src = url;
  });
}

async function makeThumb(img: HTMLImageElement, maxEdge = 320): Promise<Blob> {
  const w0 = img.naturalWidth;
  const h0 = img.naturalHeight;
  const scale = Math.min(1, maxEdge / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * scale));
  const h = Math.max(1, Math.round(h0 * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D nicht verfügbar");
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Thumbnail fehlgeschlagen"))),
      "image/webp",
      0.82,
    );
  });
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
