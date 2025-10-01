export type ClipboardHandler = (files: File[]) => void;

export function installClipboardListener(handler: ClipboardHandler): () => void {
  function onPaste(e: ClipboardEvent): void {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      handler(files);
    }
  }
  document.addEventListener("paste", onPaste);
  return () => document.removeEventListener("paste", onPaste);
}
