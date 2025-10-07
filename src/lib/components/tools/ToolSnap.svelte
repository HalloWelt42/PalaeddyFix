<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import InfoLink from "../ui/InfoLink.svelte";
  import { selection } from "../../stores/selection.svelte";
  import { analysis } from "../../stores/analysis.svelte";
  import { settings } from "../../stores/settings.svelte";
  import { getImage } from "../../storage/db";
  import { listBuiltinPalettes } from "../../palettes/builtin";
  import { runSnap } from "../../analysis/runSnap";
  import type { DitherMode } from "../../analysis/snap";
  import type { Palette } from "../../palettes/schema";

  const builtin = listBuiltinPalettes();

  let selectedPaletteId = $state<string>(builtin[0].id);
  let ditherMode = $state<DitherMode>("floyd-steinberg");
  let running = $state<boolean>(false);
  let progress = $state<number>(0);
  let error = $state<string | null>(null);
  let previewCanvas = $state<HTMLCanvasElement | null>(null);
  let lastOutput = $state<{ width: number; height: number; pixels: Uint8ClampedArray } | null>(null);

  const ownPalettes = $derived.by<Palette[]>(() => {
    const list: Palette[] = [];
    if (analysis.colors.length > 0) {
      list.push({
        id: "own-reduced",
        name: `Bild-Palette reduziert (${analysis.colors.length})`,
        colors: analysis.colors.map((c) => c.rgb),
      });
    }
    if (analysis.rareColors.length > 0) {
      list.push({
        id: "own-full",
        name: `Bild-Palette voll (${analysis.rareColors.length})`,
        colors: analysis.rareColors.map((c) => c.rgb),
      });
    }
    return list;
  });

  const allPalettes = $derived([...ownPalettes, ...builtin]);
  const selectedPalette = $derived(
    allPalettes.find((p) => p.id === selectedPaletteId) ?? allPalettes[0],
  );

  const ditherOptions: { value: DitherMode; label: string }[] = [
    { value: "none", label: "Keins" },
    { value: "floyd-steinberg", label: "Floyd-Steinberg" },
    { value: "atkinson", label: "Atkinson" },
    { value: "bayer", label: "Bayer 4×4" },
  ];

  async function doSnap(): Promise<void> {
    if (!selection.id || !selectedPalette) return;
    const img = await getImage(selection.id);
    if (!img) return;
    running = true;
    progress = 0;
    error = null;
    try {
      const out = await runSnap({
        blob: img.blob,
        palette: selectedPalette.colors,
        dither: ditherMode,
        maxEdge: settings.state.downscaleTo,
        onProgress: (p) => {
          progress = p;
        },
      });
      lastOutput = out;
      drawPreview(out);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    } finally {
      running = false;
      progress = 0;
    }
  }

  function drawPreview(out: { width: number; height: number; pixels: Uint8ClampedArray }): void {
    if (!previewCanvas) return;
    previewCanvas.width = out.width;
    previewCanvas.height = out.height;
    const ctx = previewCanvas.getContext("2d");
    if (!ctx) return;
    const imgData = new ImageData(out.pixels, out.width, out.height);
    ctx.putImageData(imgData, 0, 0);
  }

  $effect(() => {
    if (lastOutput && previewCanvas) {
      drawPreview(lastOutput);
    }
  });

  async function downloadPng(): Promise<void> {
    if (!previewCanvas || !lastOutput || !selection.id) return;
    const img = await getImage(selection.id);
    const baseName = (img?.name ?? "bild").replace(/\.[^.]+$/, "");
    const suffix = `${selectedPalette?.id}-${ditherMode}`;
    const blob: Blob | null = await new Promise((r) => previewCanvas!.toBlob(r, "image/png"));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.snap.${suffix}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
</script>

{#if !selection.id}
  <div class="empty">
    <Icon name="magic" size={32} />
    <p>Kein Bild ausgewählt.</p>
    <p class="sub">Wähle ein Bild und eine Ziel-Palette für die Umwandlung.</p>
  </div>
{:else}
  <div class="control">
    <label class="lbl" for="pal-select">Palette</label>
    <select id="pal-select" bind:value={selectedPaletteId}>
      {#if ownPalettes.length > 0}
        <optgroup label="Aus aktuellem Bild">
          {#each ownPalettes as pal (pal.id)}
            <option value={pal.id}>{pal.name}</option>
          {/each}
        </optgroup>
      {/if}
      <optgroup label="Eingebaut">
        {#each builtin as pal (pal.id)}
          <option value={pal.id}>{pal.name} ({pal.colors.length})</option>
        {/each}
      </optgroup>
    </select>
  </div>

  <div class="control">
    <label class="lbl" for="dither-select">
      <InfoLink topic="dithering">Dithering</InfoLink>
    </label>
    <select id="dither-select" bind:value={ditherMode}>
      {#each ditherOptions as opt (opt.value)}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>

  {#if selectedPalette}
    <div class="pal-preview">
      <div class="pal-name">{selectedPalette.name}</div>
      <div class="pal-swatches">
        {#each selectedPalette.colors.slice(0, 48) as rgb, i (i)}
          <span
            class="ps"
            style="background: rgb({rgb[0]}, {rgb[1]}, {rgb[2]});"
          ></span>
        {/each}
        {#if selectedPalette.colors.length > 48}
          <span class="ps-more">+{selectedPalette.colors.length - 48}</span>
        {/if}
      </div>
    </div>
  {/if}

  <button
    type="button"
    class="btn btn-primary big"
    onclick={doSnap}
    disabled={running}
  >
    {#if running}
      <span class="btn-progress" style="width: {progress * 100}%"></span>
      <span class="btn-label">Snap {Math.round(progress * 100)} %</span>
    {:else}
      <span class="btn-label">Auf Palette snappen</span>
    {/if}
  </button>

  {#if error}
    <div class="error">Fehler: {error}</div>
  {/if}

  <div class="preview-wrap">
    <div class="preview-head">
      <span class="preview-title">Vorschau</span>
      {#if lastOutput}
        <span class="preview-size">{lastOutput.width} × {lastOutput.height}</span>
      {/if}
    </div>
    <div class="preview-canvas">
      <canvas bind:this={previewCanvas}></canvas>
      {#if !lastOutput && !running}
        <div class="preview-empty">Noch keine Umwandlung</div>
      {/if}
    </div>
  </div>

  {#if lastOutput}
    <button type="button" class="btn big" onclick={downloadPng}>
      <Icon name="download" size={12} /> PNG herunterladen
    </button>
  {/if}
{/if}

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    color: var(--text-mute);
    padding: 40px 14px;
  }
  .empty p {
    font-size: 13px;
    color: var(--text-dim);
  }
  .empty .sub {
    font-size: 11px;
    max-width: 240px;
    color: var(--text-mute);
  }

  .control {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }
  .lbl {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
  }
  select {
    background: var(--bg);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 6px 8px;
    font-family: var(--font-sans);
    font-size: 12px;
    border-radius: 3px;
    outline: none;
    width: 100%;
  }
  select:focus {
    border-color: var(--accent-line);
  }

  .pal-preview {
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 8px 10px;
    margin-bottom: 12px;
  }
  .pal-name {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .pal-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    align-items: center;
  }
  .ps {
    width: 14px;
    height: 14px;
    border: 1px solid var(--border-strong);
    display: inline-block;
  }
  .ps-more {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    margin-left: 4px;
  }

  .btn {
    position: relative;
    overflow: hidden;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 8px 14px;
    font-size: 12px;
    border-radius: var(--radius-btn);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    margin-bottom: 12px;
  }
  .btn.big {
    padding: 12px 14px;
    font-size: 13px;
  }
  .btn-primary {
    background: var(--text);
    color: var(--bg);
    border-color: var(--text);
    font-weight: 600;
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }
  .btn-progress {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: var(--accent);
    z-index: 0;
    transition: width 0.15s linear;
  }
  .btn-label {
    position: relative;
    z-index: 1;
  }

  .error {
    padding: 6px 10px;
    border: 1px solid var(--err);
    color: var(--err);
    font-family: var(--font-mono);
    font-size: 11px;
    margin-bottom: 12px;
  }

  .preview-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }
  .preview-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .preview-title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-mute);
    font-weight: 600;
  }
  .preview-size {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }
  .preview-canvas {
    background: var(--surface-2);
    border: 1px solid var(--border);
    min-height: 120px;
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  .preview-canvas canvas {
    max-width: 100%;
    max-height: 280px;
    display: block;
    image-rendering: auto;
  }
  .preview-empty {
    font-family: var(--font-button);
    font-size: 13px;
    color: var(--text-mute);
    padding: 30px;
  }
</style>
