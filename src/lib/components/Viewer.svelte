<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { selection } from "../stores/selection.svelte";
  import { gallery } from "../stores/gallery.svelte";
  import { settings } from "../stores/settings.svelte";
  import { formatColor, rgbToHex } from "../analysis/convert";
  import type { RGB } from "../analysis/convert";

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let wrapperEl = $state<HTMLDivElement | null>(null);
  let hoverRgb = $state<RGB | null>(null);
  let hoverX = $state<number>(0);
  let hoverY = $state<number>(0);
  let flash = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  const item = $derived(gallery.items.find((i) => i.id === selection.id));

  $effect(() => {
    const url = selection.fullBlobUrl;
    if (!url || !canvasEl) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasEl;
      if (!c) return;
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  });

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number): string => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function onCanvasMove(e: MouseEvent): void {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const rect = canvasEl.getBoundingClientRect();
    const sx = canvasEl.width / rect.width;
    const sy = canvasEl.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * sx);
    const y = Math.floor((e.clientY - rect.top) * sy);
    if (x < 0 || y < 0 || x >= canvasEl.width || y >= canvasEl.height) return;
    const d = ctx.getImageData(x, y, 1, 1).data;
    hoverRgb = [d[0], d[1], d[2]];
    const wrapRect = wrapperEl?.getBoundingClientRect();
    if (wrapRect) {
      hoverX = e.clientX - wrapRect.left;
      hoverY = e.clientY - wrapRect.top;
    }
  }

  function onCanvasLeave(): void {
    hoverRgb = null;
  }

  async function onCanvasClick(): Promise<void> {
    if (!hoverRgb) return;
    const val = formatColor(hoverRgb, settings.state.copyFormat);
    try {
      await navigator.clipboard.writeText(val);
      triggerFlash(val);
    } catch {
      triggerFlash(`kopiert: ${val}`);
    }
  }

  function triggerFlash(msg: string): void {
    flash = msg;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flash = null), 1400);
  }

  async function back(): Promise<void> {
    await selection.select(null);
  }

  const hoverHex = $derived(hoverRgb ? rgbToHex(hoverRgb) : "");
  const hoverOut = $derived(hoverRgb ? formatColor(hoverRgb, settings.state.copyFormat) : "");
</script>

<div class="viewer">
  <div class="head">
    <button class="btn" type="button" onclick={back} title="Zurück zur Galerie">
      <Icon name="grid" size={12} /> Galerie
    </button>
    <div class="meta-head">
      {#if item}
        <b>{item.name}</b> &nbsp;
        <span>{item.width} × {item.height}</span> &nbsp;
        <span>{formatSize(item.size)}</span>
      {/if}
    </div>
    <div class="spacer"></div>
  </div>

  <div class="canvas-wrap" bind:this={wrapperEl}>
    <canvas
      bind:this={canvasEl}
      onmousemove={onCanvasMove}
      onmouseleave={onCanvasLeave}
      onclick={onCanvasClick}
    ></canvas>
    {#if hoverRgb}
      <div
        class="dropper"
        style="left:{hoverX + 16}px; top:{hoverY + 16}px;"
      >
        <div class="swatch" style="background: {hoverHex};"></div>
        <div class="vals">
          <div class="hex">{hoverHex}</div>
          <div class="out">{hoverOut}</div>
        </div>
      </div>
    {/if}
    {#if flash}
      <div class="flash">
        <Icon name="check" size={12} /> Kopiert: {flash}
      </div>
    {/if}
  </div>

  {#if item}
    <div class="footline">
      <div class="cell"><span class="k">Format</span><span class="v">{item.mime.replace("image/", "").toUpperCase()}</span></div>
      <div class="cell"><span class="k">Größe</span><span class="v">{formatSize(item.size)}</span></div>
      <div class="cell"><span class="k">Auflösung</span><span class="v">{item.width} × {item.height}</span></div>
      <div class="cell"><span class="k">Erstellt</span><span class="v">{formatDate(item.createdAt)}</span></div>
    </div>
  {/if}
</div>

<style>
  .viewer {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 10px;
    padding: 14px;
    min-height: 0;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .meta-head {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    display: flex;
    gap: 4px;
    align-items: baseline;
  }
  .meta-head b {
    color: var(--text);
    font-weight: 500;
  }
  .spacer {
    flex: 1;
  }

  .canvas-wrap {
    position: relative;
    min-height: 0;
    overflow: hidden;
    background: var(--surface-2);
    border: 1px solid var(--border);
    display: grid;
    place-items: center;
  }
  canvas {
    max-width: 100%;
    max-height: 100%;
    display: block;
    image-rendering: auto;
    cursor: crosshair;
    box-shadow: 0 8px 32px #0006;
  }

  .dropper {
    position: absolute;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    padding: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: none;
    box-shadow: 0 4px 16px #0008;
  }
  .swatch {
    width: 32px;
    height: 32px;
    border: 1px solid var(--border-strong);
  }
  .vals {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .hex {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text);
    font-weight: 600;
  }
  .out {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }

  .flash {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    background: var(--surface);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 6px 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 16px #0008;
  }

  .footline {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .k {
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 9px;
  }
  .v {
    color: var(--text);
  }

  .btn {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 5px 10px;
    font-size: 11px;
    border-radius: var(--radius-btn);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn:hover {
    border-color: var(--text);
  }
</style>
