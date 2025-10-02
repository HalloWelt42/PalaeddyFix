<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import StackedBar from "../ui/StackedBar.svelte";
  import Segmented from "../ui/Segmented.svelte";
  import InfoLink from "../ui/InfoLink.svelte";
  import { selection } from "../../stores/selection.svelte";
  import { analysis } from "../../stores/analysis.svelte";
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
</script>

{#if !selection.id}
  <div class="empty">
    <Icon name="droplet" size={32} />
    <p>Kein Bild ausgewählt.</p>
    <p class="sub">Lege ein Bild in die linke Fläche, um Farben zu analysieren.</p>
  </div>
{:else}
  <div class="section controls">
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
        disabled={analysis.running}
      >
        {#if analysis.running}Analyse läuft ...{:else}Analysieren{/if}
      </button>
      {#if analysis.cached && !analysis.running}
        <span class="cached-hint">aus Cache</span>
      {/if}
    </div>
    {#if analysis.error}
      <div class="error">Fehler: {analysis.error}</div>
    {/if}
    <div class="method-hint">
      Methode: <InfoLink topic="median-cut">median-cut</InfoLink> mit <InfoLink topic="quantisierung">Quantisierung</InfoLink>
    </div>
  </div>

  {#if analysis.colors.length > 0}
    <div class="section">
      <h3>Verteilung</h3>
      <StackedBar colors={analysis.colors} />
    </div>

    <div class="section">
      <div class="between">
        <h3 class="no-border">Farben</h3>
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
              <span class="pct">{c.percent.toFixed(1)}%</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
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

  .section {
    margin-bottom: 18px;
  }
  .section h3 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-mute);
    margin-bottom: 8px;
    font-weight: 600;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }
  .section h3.no-border {
    padding-bottom: 0;
    border-bottom: 0;
    margin-bottom: 0;
  }
  .between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }

  .controls .control-row {
    display: grid;
    grid-template-columns: 60px 1fr 36px;
    gap: 10px;
    align-items: center;
  }
  .controls .k {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
  }
  .controls .n {
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
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
  .cached-hint {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .error {
    margin-top: 8px;
    padding: 6px 10px;
    border: 1px solid var(--err);
    color: var(--err);
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .method-hint {
    margin-top: 10px;
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-mute);
    font-weight: 500;
  }

  .btn {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 8px 14px;
    font-size: 12px;
    border-radius: var(--radius-btn);
    cursor: pointer;
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

  .colors {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .color-btn {
    width: 100%;
    display: grid;
    grid-template-columns: 28px 1fr auto;
    gap: 10px;
    align-items: center;
    padding: 6px 8px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 3px;
    cursor: pointer;
    color: var(--text);
    font-family: var(--font-sans);
  }
  .color-btn:hover {
    border-color: var(--border-strong);
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
