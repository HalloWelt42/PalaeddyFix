<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import WorkingPaletteBar from "./WorkingPaletteBar.svelte";
  import { selection } from "../stores/selection.svelte";
  import { gallery } from "../stores/gallery.svelte";
  import { settings } from "../stores/settings.svelte";
  import { palettes } from "../stores/palettes.svelte";
  import { picker } from "../stores/picker.svelte";
  import { formatColor, formatColorA, hasAlpha, rgbToHex } from "../analysis/convert";
  import type { RGB } from "../analysis/convert";

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let wrapperEl = $state<HTMLDivElement | null>(null);
  let layoutTick = $state<number>(0);

  $effect(() => {
    const el = wrapperEl;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      layoutTick++;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });
  let hoverRgb = $state<RGB | null>(null);
  let hoverAlpha = $state<number>(255);
  let hoverX = $state<number>(0);
  let hoverY = $state<number>(0);
  let hoverImgX = $state<number>(0);
  let hoverImgY = $state<number>(0);
  let flash = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  const MAG_SIZE = 140;
  const MAG_ZOOM = 12;

  const item = $derived(gallery.items.find((i) => i.id === selection.id));

  let cachedImage = $state<HTMLImageElement | null>(null);

  $effect(() => {
    const url = selection.fullBlobUrl;
    if (!url || !canvasEl) return;
    const img = new Image();
    img.onload = () => {
      cachedImage = img;
      redrawCanvas();
    };
    img.src = url;
  });

  function redrawCanvas(): void {
    const c = canvasEl;
    const img = cachedImage;
    if (!c || !img) return;
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0);
  }

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

  function channelLabel(c: NonNullable<NonNullable<typeof item>["meta"]>["channels"]): string {
    if (c === "gray") return "Graustufen";
    if (c === "gray-alpha") return "Graustufen + Alpha";
    if (c === "rgb") return "RGB";
    if (c === "rgba") return "RGBA";
    if (c === "indexed") return "Indexed";
    return "-";
  }

  let dragStart = $state<{ x: number; y: number } | null>(null);
  let dragCurrent = $state<{ x: number; y: number } | null>(null);

  function toImageCoords(e: MouseEvent): { x: number; y: number } | null {
    if (!canvasEl) return null;
    const rect = canvasEl.getBoundingClientRect();
    const sx = canvasEl.width / rect.width;
    const sy = canvasEl.height / rect.height;
    const x = Math.max(0, Math.min(canvasEl.width - 1, Math.round((e.clientX - rect.left) * sx)));
    const y = Math.max(0, Math.min(canvasEl.height - 1, Math.round((e.clientY - rect.top) * sy)));
    return { x, y };
  }

  function onCanvasDown(e: MouseEvent): void {
    if (!selection.rectTool) return;
    const p = toImageCoords(e);
    if (!p) return;
    e.preventDefault();
    dragStart = p;
    dragCurrent = p;
  }

  function onCanvasUp(e: MouseEvent): void {
    if (!selection.rectTool || !dragStart) return;
    e.preventDefault();
    const end = toImageCoords(e) ?? dragStart;
    const x = Math.min(dragStart.x, end.x);
    const y = Math.min(dragStart.y, end.y);
    const w = Math.abs(end.x - dragStart.x);
    const h = Math.abs(end.y - dragStart.y);
    if (w >= 4 && h >= 4) {
      selection.setRegion({ x, y, w, h });
    }
    dragStart = null;
    dragCurrent = null;
  }

  function onCanvasMove(e: MouseEvent): void {
    if (!canvasEl) return;
    if (dragStart) {
      const p = toImageCoords(e);
      if (p) dragCurrent = p;
      return;
    }
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
    hoverAlpha = d[3];
    hoverImgX = x;
    hoverImgY = y;
    const wrapRect = wrapperEl?.getBoundingClientRect();
    if (wrapRect) {
      hoverX = e.clientX - wrapRect.left;
      hoverY = e.clientY - wrapRect.top;
    }
    scheduleAutoRefresh();
  }

  const rectOverlay = $derived.by(() => {
    void layoutTick;
    if (!canvasEl) return null;
    const src = dragStart && dragCurrent
      ? {
          x: Math.min(dragStart.x, dragCurrent.x),
          y: Math.min(dragStart.y, dragCurrent.y),
          w: Math.abs(dragCurrent.x - dragStart.x),
          h: Math.abs(dragCurrent.y - dragStart.y),
        }
      : selection.region;
    if (!src) return null;
    const rect = canvasEl.getBoundingClientRect();
    const wrapRect = wrapperEl?.getBoundingClientRect();
    if (!wrapRect) return null;
    const scaleX = rect.width / canvasEl.width;
    const scaleY = rect.height / canvasEl.height;
    return {
      left: rect.left - wrapRect.left + src.x * scaleX,
      top: rect.top - wrapRect.top + src.y * scaleY,
      width: src.w * scaleX,
      height: src.h * scaleY,
      dragging: !!dragStart,
    };
  });

  const magStyle = $derived.by(() => {
    if (!selection.fullBlobUrl || !canvasEl) return "";
    const imgW = canvasEl.width;
    const imgH = canvasEl.height;
    if (imgW === 0 || imgH === 0) return "";
    const bgW = imgW * MAG_ZOOM;
    const bgH = imgH * MAG_ZOOM;
    const bgX = MAG_SIZE / 2 - (hoverImgX + 0.5) * MAG_ZOOM;
    const bgY = MAG_SIZE / 2 - (hoverImgY + 0.5) * MAG_ZOOM;
    return (
      `background-image: url("${selection.fullBlobUrl}");` +
      `background-size: ${bgW}px ${bgH}px;` +
      `background-position: ${bgX}px ${bgY}px;` +
      `background-repeat: no-repeat;`
    );
  });

  function onCanvasLeave(): void {
    hoverRgb = null;
    hoverAlpha = 255;
  }

  async function onCanvasClick(): Promise<void> {
    if (!hoverRgb) return;
    if (picker.active) {
      const hex = rgbToHex(hoverRgb);
      const added = palettes.workingAdd([hoverRgb[0], hoverRgb[1], hoverRgb[2]]);
      if (added) triggerFlash(`+ ${hex}`);
      else {
        picker.flashDuplicate(hex);
        triggerFlash(`${hex} schon drin`);
      }
      queueMicrotask(redrawCanvas);
      return;
    }
    const val = hasAlpha(hoverAlpha)
      ? formatColorA(hoverRgb, hoverAlpha, settings.state.copyFormat)
      : formatColor(hoverRgb, settings.state.copyFormat);
    try {
      await navigator.clipboard.writeText(val);
      triggerFlash(val);
    } catch {
      triggerFlash(`kopiert: ${val}`);
    }
    queueMicrotask(redrawCanvas);
  }

  let moveRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  function scheduleAutoRefresh(): void {
    if (moveRefreshTimer) clearTimeout(moveRefreshTimer);
    moveRefreshTimer = setTimeout(() => {
      redrawCanvas();
    }, 400);
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
  const hoverOut = $derived(
    hoverRgb
      ? hasAlpha(hoverAlpha)
        ? formatColorA(hoverRgb, hoverAlpha, settings.state.copyFormat)
        : formatColor(hoverRgb, settings.state.copyFormat)
      : "",
  );
  const hoverAlphaPct = $derived(Math.round((hoverAlpha / 255) * 100));
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
    <button
      class="btn"
      type="button"
      class:btn-active={selection.rectTool}
      title={selection.rectTool ? "Rechteck-Auswahl deaktivieren" : "Rechteck-Auswahl aktivieren"}
      onclick={() => selection.toggleRectTool()}
    >
      <Icon name="grid" size={12} /> Bereich
    </button>
    {#if selection.region}
      <button
        class="btn"
        type="button"
        title="Bereich zurücksetzen"
        onclick={() => selection.clearRegion()}
      >
        <Icon name="x" size={12} /> Bereich löschen
      </button>
    {/if}
  </div>

  <div
    class="canvas-wrap"
    bind:this={wrapperEl}
    class:rect-mode={selection.rectTool}
    class:no-checker={!settings.state.viewerCheckerboard}
  >
    <canvas
      bind:this={canvasEl}
      class:hidden-canvas={settings.state.viewerAsImage}
      onmousemove={onCanvasMove}
      onmouseleave={onCanvasLeave}
      onclick={onCanvasClick}
      onmousedown={onCanvasDown}
      onmouseup={onCanvasUp}
    ></canvas>
    {#if settings.state.viewerAsImage && selection.fullBlobUrl}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <img
        class="viewer-img"
        src={selection.fullBlobUrl}
        alt={item?.name ?? "Bild"}
        onmousemove={onCanvasMove}
        onmouseleave={onCanvasLeave}
        onclick={onCanvasClick}
        onmousedown={onCanvasDown}
        onmouseup={onCanvasUp}
        draggable="false"
      />
    {/if}
    {#if rectOverlay}
      <div
        class="region-overlay"
        class:dragging={rectOverlay.dragging}
        style="left: {rectOverlay.left}px; top: {rectOverlay.top}px; width: {rectOverlay.width}px; height: {rectOverlay.height}px;"
      ></div>
    {/if}
    {#if hoverRgb}
      {@const offX = hoverX > 220 ? -(MAG_SIZE + 16) : 16}
      {@const offY = hoverY > 220 ? -(MAG_SIZE + 16) : 16}
      <div
        class="picker"
        style="left:{hoverX + offX}px; top:{hoverY + offY}px;"
      >
        <div
          class="mag"
          style="width: {MAG_SIZE}px; height: {MAG_SIZE}px; {magStyle}"
        >
          <span class="cross-h"></span>
          <span class="cross-v"></span>
          <span class="cross-pix" style="background: {hoverHex};"></span>
        </div>
        <div class="vals">
          <div class="swatch-wrap">
            <div class="swatch" style="background: {hoverHex}; opacity: {hoverAlpha / 255};"></div>
          </div>
          <div class="hex">{hoverHex}</div>
          <div class="out">{hoverOut}</div>
          {#if hasAlpha(hoverAlpha)}
            <div class="alpha">α {hoverAlphaPct} %</div>
          {/if}
          <div class="xy">{hoverImgX}, {hoverImgY}</div>
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
    {@const m = item.meta}
    <div class="footline">
      <div class="cell"><span class="k">Format</span><span class="v">{item.mime.replace("image/", "").toUpperCase()}</span></div>
      <div class="cell"><span class="k">Größe</span><span class="v">{formatSize(item.size)}</span></div>
      <div class="cell"><span class="k">Auflösung</span><span class="v">{item.width} × {item.height}</span></div>
      {#if m?.bitDepth}
        <div class="cell"><span class="k">Bit/Kanal</span><span class="v">{m.bitDepth}</span></div>
      {/if}
      {#if m?.channels}
        <div class="cell"><span class="k">Kanäle</span><span class="v">{channelLabel(m.channels)}</span></div>
      {/if}
      {#if m?.dpiX}
        <div class="cell">
          <span class="k">DPI</span>
          <span class="v">{m.dpiX}{m.dpiY && m.dpiY !== m.dpiX ? ` × ${m.dpiY}` : ""}</span>
        </div>
      {/if}
      {#if m?.colorProfile}
        <div class="cell"><span class="k">Farbprofil</span><span class="v">{m.colorProfile}</span></div>
      {/if}
      {#if m?.camera}
        <div class="cell"><span class="k">Kamera</span><span class="v">{m.camera}</span></div>
      {/if}
      {#if m?.software}
        <div class="cell"><span class="k">Software</span><span class="v">{m.software}</span></div>
      {/if}
      <div class="cell"><span class="k">Importiert</span><span class="v">{formatDate(item.createdAt)}</span></div>
    </div>
  {/if}

  {#if palettes.working.length > 0 || selection.rectTool}
    <WorkingPaletteBar />
  {/if}
</div>

<style>
  .viewer {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto auto;
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
    background-color: var(--surface-2);
    background-image: repeating-conic-gradient(
      rgba(255, 255, 255, 0.04) 0 90deg,
      transparent 90deg 180deg
    );
    background-size: 20px 20px;
    border: 1px solid var(--border);
    display: grid;
    place-items: center;
    isolation: isolate;
    contain: layout paint;
  }
  .canvas-wrap.no-checker {
    background-image: none;
  }
  canvas,
  .viewer-img {
    grid-area: 1 / 1;
    max-width: 100%;
    max-height: 100%;
    display: block;
    image-rendering: auto;
    cursor: crosshair;
    box-shadow: 0 8px 32px #0006;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  canvas.hidden-canvas {
    visibility: hidden;
  }
  .viewer-img {
    user-select: none;
    -webkit-user-drag: none;
  }

  .picker {
    position: absolute;
    pointer-events: none;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    z-index: 4;
    will-change: left, top;
    transform: translateZ(0);
  }
  .mag {
    position: relative;
    border-radius: 50%;
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.85),
      0 0 0 3px rgba(0, 0, 0, 0.6),
      0 8px 24px #000c;
    background-color: #0a0a0c;
    image-rendering: pixelated;
    overflow: hidden;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  .cross-h,
  .cross-v {
    position: absolute;
    left: 50%;
    top: 50%;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }
  .cross-h {
    width: 24px;
    height: 1px;
    transform: translate(-50%, -50%);
  }
  .cross-v {
    width: 1px;
    height: 24px;
    transform: translate(-50%, -50%);
  }
  .cross-pix {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 12px;
    height: 12px;
    transform: translate(-50%, -50%);
    border: 1px solid rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.85);
    pointer-events: none;
  }
  .vals {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    box-shadow: 0 4px 16px #0008;
    min-width: 110px;
  }
  .swatch-wrap {
    width: 100%;
    height: 16px;
    background-image:
      linear-gradient(45deg, rgba(255, 255, 255, 0.12) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255, 255, 255, 0.12) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.12) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.12) 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0;
    background-color: #1a1a20;
    border: 1px solid var(--border-strong);
    margin-bottom: 2px;
  }
  .swatch {
    width: 100%;
    height: 100%;
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
    word-break: break-all;
  }
  .alpha,
  .xy {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-mute);
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
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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
  .btn-active {
    background: var(--accent-soft);
    border-color: var(--accent-line);
    color: var(--text);
  }
  .rect-mode canvas {
    cursor: crosshair;
  }
  .region-overlay {
    position: absolute;
    border: 2px solid var(--accent);
    background: rgba(251, 191, 36, 0.08);
    pointer-events: none;
    z-index: 3;
  }
  .region-overlay.dragging {
    border-style: dashed;
  }
  .btn:hover {
    border-color: var(--text);
  }
</style>
