export type ClipboardHandler = (files: File[]) => void;

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  );
}

function extractImages(clipboardData: DataTransfer | null): File[] {
  if (!clipboardData) return [];
  const files: File[] = [];
  for (const item of Array.from(clipboardData.items)) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  if (files.length === 0) {
    for (const file of Array.from(clipboardData.files)) {
      if (file.type.startsWith("image/")) files.push(file);
    }
  }
  return files;
}

async function readClipboardImages(): Promise<File[]> {
  const nav = navigator as Navigator & {
    clipboard?: Clipboard & { read?: () => Promise<ClipboardItem[]> };
  };
  if (!nav.clipboard?.read) return [];
  try {
    const items = await nav.clipboard.read();
    const files: File[] = [];
    for (const item of items) {
      for (const type of item.types) {
        if (!type.startsWith("image/")) continue;
        try {
          const blob = await item.getType(type);
          const ext = type.split("/")[1]?.split(";")[0] ?? "png";
          files.push(new File([blob], `clipboard-${Date.now()}.${ext}`, { type }));
        } catch {
          /* ignore one type */
        }
      }
    }
    return files;
  } catch {
    return [];
  }
}

export function installClipboardListener(handler: ClipboardHandler): () => void {
  function onPaste(e: ClipboardEvent): void {
    if (isEditable(e.target)) return;
    const files = extractImages(e.clipboardData);
    if (files.length > 0) {
      e.preventDefault();
      handler(files);
    }
  }

  async function onKey(e: KeyboardEvent): Promise<void> {
    const meta = e.metaKey || e.ctrlKey;
    if (!meta) return;
    if (e.key !== "v" && e.key !== "V") return;
    if (isEditable(e.target)) return;
    const files = await readClipboardImages();
    if (files.length > 0) {
      e.preventDefault();
      handler(files);
    }
  }

  document.addEventListener("paste", onPaste);
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("paste", onPaste);
    document.removeEventListener("keydown", onKey);
  };
}
