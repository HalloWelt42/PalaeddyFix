<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { selection } from "../stores/selection.svelte";
  import { gallery } from "../stores/gallery.svelte";
  import { settings } from "../stores/settings.svelte";
  import { formatColor, formatColorA, hasAlpha, rgbToHex } from "../analysis/convert";
  import type { RGB } from "../analysis/convert";

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let wrapperEl = $state<HTMLDivElement | null>(null);
  let magEl = $state<HTMLCanvasElement | null>(null);
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
  const MAG_SAMPLES = Math.floor(MAG_SIZE / MAG_ZOOM);

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

  function channelLabel(c: NonNullable<NonNullable<typeof item>["meta"]>["channels"]): string {
    if (c === "gray") return "Graustufen";
    if (c === "gray-alpha") return "Graustufen + Alpha";
    if (c === "rgb") return "RGB";
    if (c === "rgba") return "RGBA";
    if (c === "indexed") return "Indexed";
    return "-";
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
    hoverAlpha = d[3];
    hoverImgX = x;
    hoverImgY = y;
    const wrapRect = wrapperEl?.getBoundingClientRect();
    if (wrapRect) {
      hoverX = e.clientX - wrapRect.left;
      hoverY = e.clientY - wrapRect.top;
    }
    drawMagnifier();
  }

  function drawMagnifier(): void {
    const src = canvasEl;
    const mag = magEl;
    if (!src || !mag) return;
    const mctx = mag.getContext("2d");
    if (!mctx) return;
    if (mag.width !== MAG_SIZE) {
      mag.width = MAG_SIZE;
      mag.height = MAG_SIZE;
    }
    mctx.imageSmoothingEnabled = false;
    mctx.clearRect(0, 0, MAG_SIZE, MAG_SIZE);
    const half = Math.floor(MAG_SAMPLES / 2);
    const sx = hoverImgX - half;
    const sy = hoverImgY - half;
    mctx.save();
    mctx.beginPath();
    mctx.arc(MAG_SIZE / 2, MAG_SIZE / 2, MAG_SIZE / 2 - 2, 0, Math.PI * 2);
    mctx.clip();
    mctx.fillStyle = "#0a0a0c";
    mctx.fillRect(0, 0, MAG_SIZE, MAG_SIZE);
    mctx.drawImage(
      src,
      sx,
      sy,
      MAG_SAMPLES,
      MAG_SAMPLES,
      0,
      0,
      MAG_SIZE,
      MAG_SIZE,
    );
    mctx.restore();

    const cx = MAG_SIZE / 2;
    const cy = MAG_SIZE / 2;
    const pix = MAG_ZOOM;

    mctx.lineWidth = 2;
    mctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
    mctx.strokeRect(cx - pix / 2, cy - pix / 2, pix, pix);
    mctx.lineWidth = 1;
    mctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    mctx.strokeRect(cx - pix / 2 + 0.5, cy - pix / 2 + 0.5, pix - 1, pix - 1);

    mctx.beginPath();
    mctx.moveTo(cx - pix, cy);
    mctx.lineTo(cx - pix / 2 - 2, cy);
    mctx.moveTo(cx + pix / 2 + 2, cy);
    mctx.lineTo(cx + pix, cy);
    mctx.moveTo(cx, cy - pix);
    mctx.lineTo(cx, cy - pix / 2 - 2);
    mctx.moveTo(cx, cy + pix / 2 + 2);
    mctx.lineTo(cx, cy + pix);
    mctx.lineWidth = 2;
    mctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
    mctx.stroke();
    mctx.lineWidth = 1;
    mctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    mctx.stroke();

    mctx.lineWidth = 2;
    mctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    mctx.beginPath();
    mctx.arc(cx, cy, MAG_SIZE / 2 - 2, 0, Math.PI * 2);
    mctx.stroke();
  }

  function onCanvasLeave(): void {
    hoverRgb = null;
    hoverAlpha = 255;
  }

  async function onCanvasClick(): Promise<void> {
    if (!hoverRgb) return;
    const val = hasAlpha(hoverAlpha)
      ? formatColorA(hoverRgb, hoverAlpha, settings.state.copyFormat)
      : formatColor(hoverRgb, settings.state.copyFormat);
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
  </div>

  <div class="canvas-wrap" bind:this={wrapperEl}>
    <canvas
      bind:this={canvasEl}
      onmousemove={onCanvasMove}
      onmouseleave={onCanvasLeave}
      onclick={onCanvasClick}
    ></canvas>
    {#if hoverRgb}
      {@const offX = hoverX > 220 ? -(MAG_SIZE + 16) : 16}
      {@const offY = hoverY > 220 ? -(MAG_SIZE + 16) : 16}
      <div
        class="picker"
        style="left:{hoverX + offX}px; top:{hoverY + offY}px;"
      >
        <canvas
          class="mag"
          bind:this={magEl}
          width={MAG_SIZE}
          height={MAG_SIZE}
          style="width: {MAG_SIZE}px; height: {MAG_SIZE}px;"
        ></canvas>
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
    background-color: var(--surface-2);
    background-image: repeating-conic-gradient(
      rgba(255, 255, 255, 0.04) 0 90deg,
      transparent 90deg 180deg
    );
    background-size: 20px 20px;
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

  .picker {
    position: absolute;
    pointer-events: none;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    z-index: 4;
  }
  .mag {
    border-radius: 50%;
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.85),
      0 0 0 3px rgba(0, 0, 0, 0.6),
      0 8px 24px #000c;
    background: #0a0a0c;
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
  .btn:hover {
    border-color: var(--text);
  }
</style>
