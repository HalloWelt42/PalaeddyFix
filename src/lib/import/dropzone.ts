export type DropzoneOptions = {
  onFiles: (files: File[]) => void;
  hoverClass?: string;
};

export function dropzone(node: HTMLElement, options: DropzoneOptions) {
  const cls = options.hoverClass ?? "is-drag-hover";
  let depth = 0;

  function onDragEnter(e: DragEvent): void {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth++;
    node.classList.add(cls);
  }
  function onDragOver(e: DragEvent): void {
    if (!hasFiles(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }
  function onDragLeave(e: DragEvent): void {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth--;
    if (depth <= 0) {
      depth = 0;
      node.classList.remove(cls);
    }
  }
  function onDrop(e: DragEvent): void {
    e.preventDefault();
    depth = 0;
    node.classList.remove(cls);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      options.onFiles(Array.from(files));
    }
  }

  node.addEventListener("dragenter", onDragEnter);
  node.addEventListener("dragover", onDragOver);
  node.addEventListener("dragleave", onDragLeave);
  node.addEventListener("drop", onDrop);

  return {
    destroy(): void {
      node.removeEventListener("dragenter", onDragEnter);
      node.removeEventListener("dragover", onDragOver);
      node.removeEventListener("dragleave", onDragLeave);
      node.removeEventListener("drop", onDrop);
    },
  };
}

function hasFiles(e: DragEvent): boolean {
  const types = e.dataTransfer?.types;
  if (!types) return false;
  return Array.from(types).includes("Files");
}
