<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import StackedBar from "../ui/StackedBar.svelte";
  import Segmented from "../ui/Segmented.svelte";
  import InfoLink from "../ui/InfoLink.svelte";
  import { selection } from "../../stores/selection.svelte";
  import { analysis } from "../../stores/analysis.svelte";
  import { settings } from "../../stores/settings.svelte";
  import { gallery } from "../../stores/gallery.svelte";
  import { palettes } from "../../stores/palettes.svelte";
  import { formatColor, isLight } from "../../analysis/convert";
  import { pickDistinctColors } from "../../analysis/distinct";
  import type { CopyFormat, PaletteColor, PaletteSource } from "../../storage/schema";

  type TabKey = "frequent" | "rare" | "distinct";
  let activeTab = $state<TabKey>("frequent");
  let distinctCount = $state<number>(8);

  let flash = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  const DEBOUNCE_MS = 350;
  let freqTimer: ReturnType<typeof setTimeout> | null = null;
  let rareTimer: ReturnType<typeof setTimeout> | null = null;

  async function onFrequentCount(e: Event): Promise<void> {
    const v = Number((e.target as HTMLInputElement).value);
    analysis.setColorCount(v);
    if (!selection.id) return;
    const hadCache = await analysis.loadCached(selection.id);
    if (freqTimer) clearTimeout(freqTimer);
    if (!hadCache) {
      freqTimer = setTimeout(() => {
        if (selection.id && !analysis.running) void analysis.analyze(selection.id);
      }, DEBOUNCE_MS);
    }
  }

  async function onRareCount(e: Event): Promise<void> {
    const v = Number((e.target as HTMLInputElement).value);
    analysis.setRareColorCount(v);
    if (!selection.id) return;
    const hadCache = await analysis.loadRareCached(selection.id);
    if (rareTimer) clearTimeout(rareTimer);
    if (!hadCache) {
      rareTimer = setTimeout(() => {
        if (selection.id && !analysis.rareRunning) void analysis.analyzeRare(selection.id);
      }, DEBOUNCE_MS);
    }
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
    { value: "named", label: "Named" },
  ];

  const rareSorted = $derived([...analysis.rareColors].slice().reverse());

  const distinctPool = $derived.by(() => {
    if (analysis.rareColors.length >= 32) return analysis.rareColors;
    return analysis.colors;
  });
  const distinctColors = $derived(
    distinctPool.length > 0 ? pickDistinctColors(distinctPool, distinctCount) : [],
  );

  const currentItem = $derived(gallery.items.find((i) => i.id === selection.id));

  function defaultPaletteName(source: PaletteSource): string {
    const base = currentItem?.name?.replace(/\.[^.]+$/, "") ?? "Palette";
    if (source === "analysis-frequent") return `${base} - Häufigste`;
    if (source === "analysis-rare") return `${base} - Seltenste`;
    return base;
  }

  async function saveAsPalette(source: PaletteSource, colors: PaletteColor[]): Promise<void> {
    if (colors.length === 0) return;
    const name = window.prompt("Palettenname", defaultPaletteName(source));
    if (!name || !name.trim()) return;
    await palettes.saveFromColors(name.trim(), colors, source, selection.id ?? undefined);
    showFlash(`Palette "${name.trim()}" gespeichert`);
  }
</script>

{#if !selection.id}
  <div class="empty">
    <Icon name="droplet" size={32} />
    <p>Kein Bild ausgewählt.</p>
    <p class="sub">Lege ein Bild in die linke Fläche, um Farben zu analysieren.</p>
  </div>
{:else}
  <div class="tabs">
    <button
      type="button"
      class="tab"
      class:active={activeTab === "frequent"}
      onclick={() => (activeTab = "frequent")}
    >
      Häufigste
    </button>
    <button
      type="button"
      class="tab"
      class:active={activeTab === "rare"}
      onclick={() => (activeTab = "rare")}
    >
      Seltenste
    </button>
    <button
      type="button"
      class="tab"
      class:active={activeTab === "distinct"}
      onclick={() => (activeTab = "distinct")}
    >
      Kontrastreich
    </button>
  </div>

  {#if activeTab === "distinct"}
    <div class="tab-panel">
      <div class="control-row">
        <label class="k" for="cc-dist">Anzahl</label>
        <input
          id="cc-dist"
          type="range"
          min="2"
          max="32"
          step="1"
          bind:value={distinctCount}
        />
        <span class="n">{distinctCount}</span>
      </div>

      <div class="status-bar">
        <span class="status-label">
          {#if distinctPool.length === 0}
            Erst Analyse durchlaufen lassen
          {:else if distinctPool === analysis.rareColors}
            Farthest-Point-Sampling aus {distinctPool.length} Ausreißer-Farben
          {:else}
            Farthest-Point-Sampling aus {distinctPool.length} Häufigste-Farben
          {/if}
        </span>
      </div>

      {#if distinctColors.length > 0}
        <StackedBar colors={distinctColors} />
        <div class="between">
          <span class="count">{distinctColors.length} Farben, maximal verschieden</span>
          <div class="actions">
            <button
              type="button"
              class="save"
              title="Als eigene Palette speichern"
              onclick={() => void saveAsPalette("manual", distinctColors)}
            >
              <Icon name="star" size={11} /> Speichern
            </button>
            <Segmented
              options={formatOptions}
              value={settings.state.copyFormat}
              onchange={onFormatChange}
            />
          </div>
        </div>
        <ul class="colors">
          {#each distinctColors as c, i (i + "-d-" + c.hex)}
            <li>
              <button
                type="button"
                class="color-btn"
                onclick={() => copyColor(c)}
                title="Klick zum Kopieren"
                style="--sw: {c.hex};"
              >
                <span class="swatch"></span>
                <span class="vals">
                  <span class="hex">{c.hex}</span>
                  <span class="fmt">{formatColor(c.rgb, settings.state.copyFormat)}</span>
                </span>
                <span class="rank">#{i + 1}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="hint">
          Wählt per
          <InfoLink topic="cie2000">Delta E (CIE2000)</InfoLink>
          eine Teilmenge, die sich perzeptiv maximal voneinander unterscheidet --
          nützlich für Labels, Diagramme oder Kategorien.
        </div>
      {/if}
    </div>
  {:else if activeTab === "frequent"}
    <div class="tab-panel">
      <div class="control-row">
        <label class="k" for="cc-freq">Farben</label>
        <input
          id="cc-freq"
          type="range"
          min="2"
          max="256"
          step="1"
          value={analysis.colorCount}
          oninput={onFrequentCount}
        />
        <span class="n">{analysis.colorCount}</span>
      </div>

      <div class="status-bar" class:on={analysis.running}>
        <span class="status-progress" style="width: {analysis.running ? analysis.progress * 100 : 0}%"></span>
        <span class="status-label">
          {#if analysis.running}
            Analyse läuft {Math.round(analysis.progress * 100)} %
          {:else if analysis.cached && analysis.colors.length > 0}
            Aus Cache · automatisch aktualisiert
          {:else if analysis.colors.length > 0}
            Aktuell · Slider bewegt sich, Analyse folgt automatisch
          {:else}
            Wird automatisch analysiert, sobald du den Slider bewegst
          {/if}
        </span>
      </div>

      {#if analysis.colors.length > 0}
        <StackedBar colors={analysis.colors} />
        <div class="between">
          <span class="count">{analysis.colors.length} Farben</span>
          <div class="actions">
            <button
              type="button"
              class="save"
              title="Als eigene Palette speichern"
              onclick={() => void saveAsPalette("analysis-frequent", analysis.colors)}
            >
              <Icon name="star" size={11} /> Speichern
            </button>
            <Segmented
              options={formatOptions}
              value={settings.state.copyFormat}
              onchange={onFormatChange}
            />
          </div>
        </div>
        <ul class="colors">
          {#each analysis.colors as c, i (i + "-f-" + c.hex)}
            <li>
              <button
                type="button"
                class="color-btn"
                onclick={() => copyColor(c)}
                title="Klick zum Kopieren"
                style="--sw: {c.hex};"
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
  {:else}
    <div class="tab-panel">
      <div class="control-row">
        <label class="k" for="cc-rare">Buckets</label>
        <input
          id="cc-rare"
          type="range"
          min="8"
          max="256"
          step="1"
          value={analysis.rareColorCount}
          oninput={onRareCount}
        />
        <span class="n">{analysis.rareColorCount}</span>
      </div>

      <div class="status-bar" class:on={analysis.rareRunning}>
        <span class="status-progress" style="width: {analysis.rareRunning ? analysis.rareProgress * 100 : 0}%"></span>
        <span class="status-label">
          {#if analysis.rareRunning}
            Analyse läuft {Math.round(analysis.rareProgress * 100)} %
          {:else if analysis.rareCached && analysis.rareColors.length > 0}
            Aus Cache · automatisch aktualisiert
          {:else if analysis.rareColors.length > 0}
            Aktuell · Slider bewegt sich, Analyse folgt automatisch
          {:else}
            Bewege den Slider, um die Rare-Analyse zu starten
          {/if}
        </span>
      </div>

      {#if analysis.rareColors.length > 0}
        <StackedBar colors={rareSorted} />
        <div class="between">
          <span class="count">{analysis.rareColors.length} Farben, aufsteigend</span>
          <div class="actions">
            <button
              type="button"
              class="save"
              title="Als eigene Palette speichern"
              onclick={() => void saveAsPalette("analysis-rare", rareSorted)}
            >
              <Icon name="star" size={11} /> Speichern
            </button>
            <Segmented
              options={formatOptions}
              value={settings.state.copyFormat}
              onchange={onFormatChange}
            />
          </div>
        </div>
        <ul class="colors">
          {#each rareSorted as c, i (i + "-r-" + c.hex)}
            <li>
              <button
                type="button"
                class="color-btn"
                onclick={() => copyColor(c)}
                title="Klick zum Kopieren"
                style="--sw: {c.hex};"
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
          Analysiert das Bild mit {analysis.rareColorCount} Buckets. Je höher die
          Bucket-Zahl, desto feiner werden Ausreißer-Farben sichtbar.
        </div>
      {/if}
    </div>
  {/if}

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

  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    border-bottom: 1px solid var(--border-strong);
    margin-bottom: 14px;
  }
  .tab {
    background: transparent;
    color: var(--text-dim);
    border: 0;
    border-bottom: 2px solid transparent;
    padding: 10px 12px;
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    cursor: pointer;
    margin-bottom: -1px;
  }
  .tab:hover {
    color: var(--text);
  }
  .tab.active {
    color: var(--text);
    border-bottom-color: var(--accent);
  }

  .tab-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 14px;
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

  .status-bar {
    position: relative;
    overflow: hidden;
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 8px 12px;
    border-radius: var(--radius-btn);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
  }
  .status-bar.on {
    border-color: var(--accent-line);
  }
  .status-progress {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: var(--accent-soft);
    z-index: 0;
    transition: width 0.15s linear;
  }
  .status-label {
    position: relative;
    z-index: 1;
  }


  .between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  .actions {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }
  .save {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text-dim);
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    transition: color 0.12s, border-color 0.12s;
  }
  .save:hover {
    color: var(--text);
    border-color: var(--text-dim);
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
    font-size: 13px;
    color: var(--text-dim);
    padding: 10px 12px;
    background: var(--info-soft);
    border: 1px solid var(--info-line);
    border-radius: 3px;
    line-height: 1.45;
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
    max-height: 320px;
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
  .pct,
  .rank {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    font-weight: 600;
    text-align: right;
  }
  .rank {
    color: var(--text-dim);
    font-size: 10px;
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
