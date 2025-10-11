<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import PromptModal from "./ui/PromptModal.svelte";
  import { palettes } from "../stores/palettes.svelte";
  import { rgbToHex } from "../analysis/convert";
  import type { PaletteColor } from "../storage/schema";
  import { runExport, downloadOutput } from "../export/formats";

  type Props = {
    compact?: boolean;
  };

  const { compact = false }: Props = $props();

  let saveOpen = $state<boolean>(false);
  let dragIndex = $state<number>(-1);
  let dragOverIndex = $state<number>(-1);
  let copied = $state<boolean>(false);

  const workingAsPalette = $derived<PaletteColor[]>(
    palettes.working.map((rgb, i) => ({
      rgb,
      hex: rgbToHex(rgb),
      count: 1,
      percent: 100 / Math.max(1, palettes.working.length),
    })),
  );

  async function copyHexList(): Promise<void> {
    const text = palettes.working.map((c) => rgbToHex(c)).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 1400);
    } catch {
      /* ignore */
    }
  }

  function downloadPalette(): void {
    if (workingAsPalette.length === 0) return;
    const out = runExport("hex", workingAsPalette);
    downloadOutput({ ...out, filename: "arbeitspalette.txt" });
  }

  function onDragStart(i: number, e: DragEvent): void {
    dragIndex = i;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(i));
    }
  }

  function onDragOver(i: number, e: DragEvent): void {
    if (dragIndex < 0) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    dragOverIndex = i;
  }

  function onDrop(i: number, e: DragEvent): void {
    e.preventDefault();
    if (dragIndex >= 0 && dragIndex !== i) {
      palettes.workingMove(dragIndex, i);
    }
    dragIndex = -1;
    dragOverIndex = -1;
  }

  function onDragEnd(): void {
    dragIndex = -1;
    dragOverIndex = -1;
  }

  async function confirmSave(name: string): Promise<void> {
    saveOpen = false;
    if (!name.trim()) return;
    await palettes.workingSaveAs(name.trim());
    palettes.workingClear();
  }
</script>

<div class="wpal" class:compact>
  <div class="head">
    <div class="title">
      <Icon name="palette" size={12} />
      <b>Arbeitspalette</b>
      <span class="count">{palettes.working.length}</span>
    </div>
    {#if palettes.working.length > 0}
      <div class="actions">
        <button
          type="button"
          class="btn"
          title="Hex-Liste in die Zwischenablage"
          onclick={() => void copyHexList()}
        >
          <Icon name={copied ? "check" : "copy"} size={11} />
          {copied ? "Kopiert" : "Kopieren"}
        </button>
        <button
          type="button"
          class="btn"
          title="Als palette.txt herunterladen"
          onclick={downloadPalette}
        >
          <Icon name="download" size={11} /> Download
        </button>
        <button
          type="button"
          class="btn save"
          title="Als eigene Palette speichern"
          onclick={() => (saveOpen = true)}
        >
          <Icon name="star" size={11} /> Speichern
        </button>
        <button
          type="button"
          class="btn"
          title="Arbeitspalette leeren"
          onclick={() => palettes.workingClear()}
        >
          <Icon name="trash" size={11} /> Leeren
        </button>
      </div>
    {/if}
  </div>

  <div class="swatches">
    {#if palettes.working.length === 0}
      <p class="hint">
        Leer -- im Zonal-Tab auf <b>Arbeitspalette</b> klicken, um Zonenfarben
        zu sammeln. Mehrere Durchgänge möglich.
      </p>
    {:else}
      {#each palettes.working as rgb, i (i + "-" + rgbToHex(rgb))}
        {@const hex = rgbToHex(rgb)}
        <button
          type="button"
          class="sw"
          class:dragging={dragIndex === i}
          class:drag-over={dragOverIndex === i && dragIndex !== i}
          style="background: {hex};"
          title="{hex} – Klick entfernt, Ziehen sortiert"
          onclick={() => palettes.workingRemoveAt(i)}
          aria-label="Farbe {hex} aus Arbeitspalette entfernen"
          draggable="true"
          ondragstart={(e) => onDragStart(i, e)}
          ondragover={(e) => onDragOver(i, e)}
          ondrop={(e) => onDrop(i, e)}
          ondragend={onDragEnd}
        ></button>
      {/each}
    {/if}
  </div>
</div>

<PromptModal
  open={saveOpen}
  title="Arbeitspalette speichern"
  label="Name"
  defaultValue="Arbeitspalette"
  confirmLabel="Speichern"
  onConfirm={confirmSave}
  onCancel={() => (saveOpen = false)}
/>

<style>
  .wpal {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .wpal.compact {
    padding: 6px 8px;
    gap: 4px;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .title b {
    color: var(--text);
    font-weight: 600;
  }
  .count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-mute);
  }
  .actions {
    display: inline-flex;
    gap: 4px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text-dim);
    font-family: var(--font-button);
    font-size: 10px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: var(--radius-btn);
    cursor: pointer;
  }
  .btn:hover {
    color: var(--text);
    border-color: var(--text-dim);
  }
  .btn.save:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    align-items: center;
    min-height: 16px;
  }
  .sw {
    width: 18px;
    height: 18px;
    border: 1px solid var(--border-strong);
    padding: 0;
    cursor: pointer;
    position: relative;
    transition: transform 0.12s;
  }
  .sw:hover {
    transform: scale(1.2);
    z-index: 1;
    box-shadow: 0 0 0 2px var(--err);
  }
  .sw:hover::after {
    content: "×";
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    text-shadow: 0 0 3px #000;
  }
  .sw.dragging {
    opacity: 0.4;
  }
  .sw.drag-over {
    box-shadow: 0 0 0 2px var(--accent);
    transform: translateX(2px);
  }
  .hint {
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-mute);
    margin: 0;
  }
</style>
