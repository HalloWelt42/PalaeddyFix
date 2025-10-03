<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import InfoLink from "../ui/InfoLink.svelte";
  import { analysis } from "../../stores/analysis.svelte";
  import { settings } from "../../stores/settings.svelte";
  import { formatColor, rgbToHex } from "../../analysis/convert";
  import { listBuiltinPalettes } from "../../palettes/builtin";
  import { matchAllPalettes } from "../../palettes/match";
  import type { PaletteMatch } from "../../palettes/schema";

  const palettes = listBuiltinPalettes();

  const matches = $derived.by<PaletteMatch[]>(() => {
    if (analysis.colors.length === 0) return [];
    return matchAllPalettes(analysis.colors, palettes);
  });

  let flash = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  async function copyPalette(m: PaletteMatch): Promise<void> {
    const text = m.palette.colors.map((rgb) => rgbToHex(rgb)).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    showFlash(`${m.palette.name} kopiert`);
  }

  async function copySwatch(rgb: [number, number, number]): Promise<void> {
    const val = formatColor(rgb, settings.state.copyFormat);
    try {
      await navigator.clipboard.writeText(val);
    } catch {
      /* ignore */
    }
    showFlash(val);
  }

  function showFlash(msg: string): void {
    flash = msg;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flash = null), 1400);
  }

  function scoreLabel(m: PaletteMatch): string {
    if (m.weightedDistance < 2) return "Exzellent";
    if (m.weightedDistance < 4) return "Sehr gut";
    if (m.weightedDistance < 8) return "Gut";
    if (m.weightedDistance < 15) return "Passabel";
    return "Entfernt";
  }
</script>

{#if analysis.colors.length === 0}
  <div class="empty">
    <Icon name="palette" size={32} />
    <p>Erst analysieren.</p>
    <p class="sub">
      Die Paletten werden mit dem Ergebnis des Häufigste-Tabs verglichen.
    </p>
  </div>
{:else}
  <div class="head">
    <h3>Paletten-Vergleich</h3>
    <span class="count">{palettes.length} Paletten</span>
  </div>

  <p class="lead">
    Jede Bildfarbe wird ihrer nächsten Paletten-Farbe zugeordnet, gewichtet nach
    Anteil. Als Distanz dient
    <InfoLink topic="cie2000">Delta E (CIE2000)</InfoLink>.
  </p>

  <ul class="matches">
    {#each matches as m, i (m.palette.id)}
      <li>
        <div class="rank-row">
          <span class="rank">{(i + 1).toString().padStart(2, "0")}</span>
          <div class="name">
            <b>{m.palette.name}</b>
            {#if m.palette.author}
              <span class="author">{m.palette.author}</span>
            {/if}
          </div>
          <div class="score">
            <span class="dE">ΔE {m.weightedDistance.toFixed(2)}</span>
            <span class="label">{scoreLabel(m)}</span>
          </div>
        </div>

        <div class="swatches">
          {#each m.palette.colors as rgb, ci (ci)}
            <button
              type="button"
              class="swatch-btn"
              style="background: {rgbToHex(rgb)};"
              title={rgbToHex(rgb)}
              onclick={() => copySwatch(rgb)}
            ></button>
          {/each}
        </div>

        <div class="meta">
          <span>Abdeckung: <b>{(m.coverage * 100).toFixed(0)} %</b></span>
          <span>Genutzt: <b>{m.usedColors} / {m.palette.colors.length}</b></span>
          <button type="button" class="copy-btn" onclick={() => copyPalette(m)} title="Palette kopieren">
            <Icon name="copy" size={11} /> Kopieren
          </button>
        </div>
      </li>
    {/each}
  </ul>

  {#if flash}
    <div class="flash"><Icon name="check" size={12} /> {flash}</div>
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

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 6px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }
  .head h3 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text);
    font-weight: 600;
  }
  .count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }

  .lead {
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-dim);
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .matches {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .matches li {
    border: 1px solid var(--border);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--surface-2);
  }

  .rank-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
  }
  .rank {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 700;
    color: var(--text-mute);
    min-width: 22px;
  }
  .name b {
    font-weight: 600;
    color: var(--text);
    font-size: 13px;
  }
  .name .author {
    display: block;
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-mute);
    letter-spacing: 0.5px;
    margin-top: 1px;
  }
  .score {
    display: flex;
    flex-direction: column;
    gap: 1px;
    text-align: right;
  }
  .score .dE {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text);
    font-weight: 600;
  }
  .score .label {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  .swatch-btn {
    width: 22px;
    height: 22px;
    border: 1px solid var(--border-strong);
    padding: 0;
    cursor: pointer;
    transition: transform 0.08s;
  }
  .swatch-btn:hover {
    transform: scale(1.15);
    z-index: 1;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }
  .meta b {
    color: var(--text);
    font-weight: 500;
  }
  .copy-btn {
    margin-left: auto;
    background: transparent;
    border: 1px solid var(--border-strong);
    color: var(--text-dim);
    padding: 3px 8px;
    font-family: var(--font-mono);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .copy-btn:hover {
    color: var(--text);
    border-color: var(--text);
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
