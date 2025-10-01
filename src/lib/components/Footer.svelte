<script lang="ts">
  import versionData from "../../../version.json";
  import { gallery } from "../stores/gallery.svelte";
  import { selection } from "../stores/selection.svelte";
  import { analysis } from "../stores/analysis.svelte";

  const version = (versionData as { version: string }).version;

  const selectedName = $derived.by(() => {
    if (!selection.id) return "---";
    const item = gallery.items.find((i) => i.id === selection.id);
    return item?.name ?? "---";
  });

  const topColor = $derived(analysis.colors[0] ?? null);

  function formatMB(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatPixels(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} Mpx`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)} kpx`;
    return `${n} px`;
  }
</script>

<footer class="footer">
  {#if analysis.running}
    <div class="progress" aria-label="Analyse-Fortschritt">
      <div class="progress-fill" style="width: {Math.max(2, analysis.progress * 100)}%;"></div>
    </div>
  {/if}

  <div class="group left">
    <span>
      <span class="dot" class:running={analysis.running}></span>
      <b>{analysis.running ? "Analyse läuft" : "Bereit"}</b>
    </span>
    <span class="sep">·</span>
    <span>v<b>{version}</b></span>
    <span class="sep">·</span>
    <span>Speicher: <b>{formatMB(gallery.usage.used)}</b></span>
  </div>

  <div class="group mid">
    {#if analysis.running}
      <span>Fortschritt: <b>{Math.round(analysis.progress * 100)} %</b></span>
    {:else if analysis.colors.length > 0}
      <span>Farben: <b>{analysis.colors.length}</b></span>
      <span class="sep">·</span>
      <span>Pixel: <b>{formatPixels(analysis.totalPixels)}</b></span>
      {#if analysis.analyzedWidth > 0}
        <span class="sep">·</span>
        <span>Analyse: <b>{analysis.analyzedWidth} × {analysis.analyzedHeight}</b></span>
      {/if}
      {#if topColor}
        <span class="sep">·</span>
        <span class="top">
          Top:
          <span class="swatch" style="background: {topColor.hex};"></span>
          <b>{topColor.hex}</b>
          <span class="pct">{topColor.percent.toFixed(1)} %</span>
        </span>
      {/if}
      {#if analysis.cached}
        <span class="sep">·</span>
        <span class="mute">Cache</span>
      {/if}
    {/if}
  </div>

  <div class="group right">
    <span>Auswahl: <b>{selectedName}</b></span>
    <span class="sep">·</span>
    <span><b>{gallery.items.length}</b> Bilder</span>
  </div>
</footer>

<style>
  .footer {
    background: var(--surface);
    border-top: 1px solid var(--border);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 0 14px;
    gap: 14px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 0.5px;
    position: relative;
  }
  .progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--surface-2);
  }
  .progress-fill {
    height: 100%;
    background: var(--text);
    transition: width 0.18s linear;
  }
  .group {
    display: flex;
    gap: 8px;
    align-items: center;
    white-space: nowrap;
  }
  .group.mid {
    justify-content: center;
    overflow: hidden;
  }
  .sep {
    color: var(--text-mute);
  }
  b {
    color: var(--text);
    font-weight: 500;
  }
  .mute {
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .dot {
    width: 6px;
    height: 6px;
    background: var(--ok);
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
  }
  .dot.running {
    background: var(--warn);
    animation: pulse 0.9s ease-in-out infinite;
  }
  .top {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .top .swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 1px solid var(--border-strong);
  }
  .pct {
    color: var(--text-dim);
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
</style>
