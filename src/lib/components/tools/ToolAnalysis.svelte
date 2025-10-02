<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import StackedBar from "../ui/StackedBar.svelte";
  import Segmented from "../ui/Segmented.svelte";
  import InfoLink from "../ui/InfoLink.svelte";
  import { selection } from "../../stores/selection.svelte";
  import { analysis, RARE_COLOR_COUNT } from "../../stores/analysis.svelte";
  import { settings } from "../../stores/settings.svelte";
  import { formatColor, isLight } from "../../analysis/convert";
  import type { CopyFormat, PaletteColor } from "../../storage/schema";

  let flash = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const id = selection.id;
    if (!id) {
      analysis.clear();
      return;
    }
    void analysis.loadCached(id);
  });

  async function onCount(e: Event): Promise<void> {
    const v = Number((e.target as HTMLInputElement).value);
    analysis.setColorCount(v);
    if (selection.id) {
      await analysis.loadCached(selection.id);
    }
  }

  async function doAnalyze(): Promise<void> {
    if (!selection.id) return;
    await analysis.analyze(selection.id);
  }

  async function doAnalyzeRare(): Promise<void> {
    if (!selection.id) return;
    await analysis.analyzeRare(selection.id);
  }

  async function copyColor(c: PaletteColor): Promise<void> {
    const val = formatColor(c.rgb, settings.state.copyFormat);
    try {
      await navigator.clipboard.writeText(val);
    } catch {
      /* ignore */
    }
    showFlash(val);
  }

  function onFormatChange(v: CopyFormat): void {
    settings.setCopyFormat(v);
  }

  function showFlash(msg: string): void {
    flash = msg;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flash = null), 1400);
  }

  const formatOptions: { value: CopyFormat; label: string }[] = [
    { value: "hex", label: "HEX" },
    { value: "rgb", label: "RGB" },
    { value: "hsl", label: "HSL" },
    { value: "oklch", label: "OKLCH" },
  ];

  const rareSorted = $derived([...analysis.rareColors].slice().reverse());
</script>

{#if !selection.id}
  <div class="empty">
    <Icon name="droplet" size={32} />
    <p>Kein Bild ausgewählt.</p>
    <p class="sub">Lege ein Bild in die linke Fläche, um Farben zu analysieren.</p>
  </div>
{:else}
  <div class="sub-panel">
    <div class="sub-head">
      <h3>Häufigste Farben</h3>
      {#if analysis.cached && !analysis.running && analysis.colors.length > 0}
        <span class="tag">Cache</span>
      {/if}
    </div>
    <div class="control-row">
      <label class="k" for="cc">Farben</label>
      <input
        id="cc"
        type="range"
        min="2"
        max="256"
        step="1"
        value={analysis.colorCount}
        oninput={onCount}
      />
      <span class="n">{analysis.colorCount}</span>
    </div>
    <div class="actions">
      <button
        type="button"
        class="btn btn-primary"
        onclick={doAnalyze}
        disabled={analysis.running || analysis.rareRunning}
      >
        {#if analysis.running}
          <span class="btn-progress" style="width: {analysis.progress * 100}%"></span>
          <span>Analyse {Math.round(analysis.progress * 100)} %</span>
        {:else}
          Häufigste analysieren
        {/if}
      </button>
    </div>

    {#if analysis.colors.length > 0}
      <StackedBar colors={analysis.colors} />
      <div class="between">
        <span class="count">{analysis.colors.length} Farben</span>
        <Segmented
          options={formatOptions}
          value={settings.state.copyFormat}
          onchange={onFormatChange}
        />
      </div>
      <ul class="colors">
        {#each analysis.colors as c, i (i + "-" + c.hex)}
          <li>
            <button
              type="button"
              class="color-btn"
              onclick={() => copyColor(c)}
              title="Klick zum Kopieren"
              style="--sw: {c.hex}; --fg: {isLight(c.rgb) ? '#0d0d11' : '#ffffff'};"
            >
              <span class="swatch"></span>
              <span class="vals">
                <span class="hex">{c.hex}</span>
                <span class="fmt">{formatColor(c.rgb, settings.state.copyFormat)}</span>
              </span>
              <span class="pct">{c.percent.toFixed(2)} %</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="sub-panel">
    <div class="sub-head">
      <h3>Seltenste Farben</h3>
      <span class="fixed">Bucket-Größe <b>{RARE_COLOR_COUNT}</b></span>
      {#if analysis.rareCached && !analysis.rareRunning && analysis.rareColors.length > 0}
        <span class="tag">Cache</span>
      {/if}
    </div>
    <div class="actions">
      <button
        type="button"
        class="btn btn-primary"
        onclick={doAnalyzeRare}
        disabled={analysis.running || analysis.rareRunning}
      >
        {#if analysis.rareRunning}
          <span class="btn-progress" style="width: {analysis.rareProgress * 100}%"></span>
          <span>Analyse {Math.round(analysis.rareProgress * 100)} %</span>
        {:else}
          Seltenste analysieren
        {/if}
      </button>
    </div>

    {#if analysis.rareColors.length > 0}
      <StackedBar colors={rareSorted} />
      <div class="between">
        <span class="count">{analysis.rareColors.length} Farben, aufsteigend</span>
      </div>
      <ul class="colors">
        {#each rareSorted as c, i (i + "-r-" + c.hex)}
          <li>
            <button
              type="button"
              class="color-btn"
              onclick={() => copyColor(c)}
              title="Klick zum Kopieren"
              style="--sw: {c.hex}; --fg: {isLight(c.rgb) ? '#0d0d11' : '#ffffff'};"
            >
              <span class="swatch"></span>
              <span class="vals">
                <span class="hex">{c.hex}</span>
                <span class="fmt">{formatColor(c.rgb, settings.state.copyFormat)}</span>
              </span>
              <span class="pct">{c.percent.toFixed(3)} %</span>
            </button>
          </li>
        {/each}
      </ul>
    {:else if !analysis.rareRunning}
      <div class="hint">
        Nutzt eine feine Quantisierung mit {RARE_COLOR_COUNT} Buckets,
        damit auch kleine Farbanteile sichtbar werden.
      </div>
    {/if}
  </div>

  <div class="method-hint">
    Methode: <InfoLink topic="median-cut">median-cut</InfoLink>
    mit <InfoLink topic="quantisierung">Quantisierung</InfoLink>
  </div>

  {#if analysis.error}
    <div class="error">Fehler: {analysis.error}</div>
  {/if}

  {#if flash}
    <div class="flash">
      <Icon name="check" size={12} /> Kopiert: {flash}
    </div>
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
    max-width: 220px;
    color: var(--text-mute);
  }

  .sub-panel {
    border: 1px solid var(--border);
    background: var(--bg);
    padding: 12px;
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .sub-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sub-head h3 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text);
    font-weight: 600;
    flex: 1;
  }
  .tag {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
    border: 1px solid var(--border-strong);
    padding: 1px 6px;
  }
  .fixed {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }
  .fixed b {
    color: var(--text);
    font-weight: 500;
  }

  .control-row {
    display: grid;
    grid-template-columns: 60px 1fr 40px;
    gap: 10px;
    align-items: center;
  }
  .control-row .k {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
  }
  .control-row .n {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    text-align: right;
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--text);
  }

  .actions {
    display: flex;
    gap: 6px;
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
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
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
  .btn-primary :global(span) {
    position: relative;
    z-index: 1;
  }

  .between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .hint {
    font-family: var(--font-button);
    font-size: 12px;
    color: var(--text-dim);
    padding: 8px 10px;
    background: var(--info-soft);
    border: 1px solid var(--info-line);
    border-radius: 3px;
  }

  .error {
    padding: 6px 10px;
    border: 1px solid var(--err);
    color: var(--err);
    font-family: var(--font-mono);
    font-size: 11px;
  }

  .method-hint {
    margin-top: 4px;
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-mute);
    font-weight: 500;
  }

  .colors {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 360px;
    overflow: auto;
    border: 1px solid var(--border);
  }
  .color-btn {
    width: 100%;
    display: grid;
    grid-template-columns: 28px 1fr auto;
    gap: 10px;
    align-items: center;
    padding: 6px 8px;
    background: var(--surface-2);
    border: 0;
    cursor: pointer;
    color: var(--text);
    font-family: var(--font-sans);
  }
  .color-btn:hover {
    background: var(--surface-3);
  }
  .swatch {
    display: block;
    width: 28px;
    height: 28px;
    background: var(--sw);
    border: 1px solid var(--border-strong);
  }
  .vals {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    text-align: left;
  }
  .vals .hex {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    font-weight: 600;
  }
  .vals .fmt {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pct {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    font-weight: 600;
    text-align: right;
  }

  .flash {
    position: fixed;
    right: 80px;
    bottom: 50px;
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
    z-index: 20;
  }
</style>
