<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import InfoLink from "../ui/InfoLink.svelte";
  import { analysis } from "../../stores/analysis.svelte";
  import { settings } from "../../stores/settings.svelte";
  import { palettes } from "../../stores/palettes.svelte";
  import { formatColor, rgbToHex } from "../../analysis/convert";
  import { listBuiltinPalettes } from "../../palettes/builtin";
  import { matchAllPalettes, perfectMatchIndices } from "../../palettes/match";
  import type { Palette, PaletteMatch } from "../../palettes/schema";

  const builtin = listBuiltinPalettes();

  const activeBuiltin = $derived(
    builtin.filter((p) => palettes.isBuiltinActive(p.id)),
  );
  const activeStored = $derived<Palette[]>(
    palettes.items
      .filter((p) => p.pinned)
      .map((p) => ({
        id: `stored-${p.id}`,
        name: p.name,
        colors: p.colors,
      })),
  );

  const ownPalettes = $derived.by<Palette[]>(() => {
    const list: Palette[] = [];
    if (analysis.colors.length > 0) {
      list.push({
        id: "own-reduced",
        name: `Bild-Palette reduziert (${analysis.colors.length})`,
        colors: analysis.colors.map((c) => c.rgb),
        description: "Aus der Häufigste-Analyse erzeugt",
      });
    }
    if (analysis.rareColors.length > 0) {
      list.push({
        id: "own-full",
        name: `Bild-Palette voll (${analysis.rareColors.length})`,
        colors: analysis.rareColors.map((c) => c.rgb),
        description: "Aus der Seltenste-Analyse erzeugt",
      });
    }
    return list;
  });

  const allPalettes = $derived([...ownPalettes, ...activeStored, ...activeBuiltin]);

  const matches = $derived.by<PaletteMatch[]>(() => {
    if (analysis.colors.length === 0) return [];
    return matchAllPalettes(analysis.colors, allPalettes);
  });

  function isOwn(id: string): boolean {
    return id.startsWith("own-") || id.startsWith("stored-");
  }

  let matchThreshold = $state<number>(2);

  const perfectByPalette = $derived.by<Map<string, Set<number>>>(() => {
    const map = new Map<string, Set<number>>();
    if (analysis.colors.length === 0) return map;
    for (const pal of allPalettes) {
      if (isOwn(pal.id)) continue;
      map.set(pal.id, perfectMatchIndices(pal, analysis.colors, matchThreshold));
    }
    return map;
  });

  function thresholdLabel(t: number): string {
    if (t < 0.5) return "Bitgenau";
    if (t < 1.5) return "Praktisch identisch";
    if (t < 3) return "Kaum unterscheidbar";
    if (t < 5) return "Dicht dran";
    if (t < 8) return "Weit";
    return "Sehr weit";
  }

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
  <div class="sticky-top">
    <div class="head">
      <h3>Paletten-Vergleich</h3>
      <span class="count">
        {allPalettes.length} Paletten
        {#if activeBuiltin.length + activeStored.length > 0}
          · {activeBuiltin.length + activeStored.length} aktiv
        {/if}
      </span>
    </div>

    <p class="lead">
      Jede Bildfarbe wird ihrer nächsten Paletten-Farbe zugeordnet, gewichtet nach
      Anteil. Als Distanz dient
      <InfoLink topic="cie2000">Delta E (CIE2000)</InfoLink>.
    </p>

    {#if activeBuiltin.length === 0 && activeStored.length === 0}
      <div class="hint-empty">
        Keine fertige oder eigene Palette aktiviert. Markiere in der Galerie
        Paletten mit dem ⭐ Stern, um sie in den Vergleich aufzunehmen.
        Aktuell werden nur die Bild-Paletten verglichen.
      </div>
    {/if}

    <div class="threshold">
      <div class="th-head">
        <label for="th-range" class="th-label">Treffer-Schwelle</label>
        <span class="th-val">
          ΔE <b>{matchThreshold.toFixed(1)}</b>
          · {thresholdLabel(matchThreshold)}
        </span>
      </div>
      <input
        id="th-range"
        type="range"
        min="0"
        max="10"
        step="0.1"
        bind:value={matchThreshold}
      />
      <div class="th-axis">
        <span>bitgenau</span>
        <span>kaum unterscheidbar</span>
        <span>weit</span>
      </div>
    </div>
  </div>

  <ul class="matches">
    {#each matches as m, i (m.palette.id)}
      <li class:own={isOwn(m.palette.id)}>
        <div class="rank-row">
          <span class="rank">{(i + 1).toString().padStart(2, "0")}</span>
          <div class="name">
            <b>{m.palette.name}</b>
            {#if isOwn(m.palette.id)}
              <span class="badge-own">Eigen</span>
            {/if}
            {#if m.palette.author}
              <span class="author">{m.palette.author}</span>
            {/if}
            {#if m.palette.description}
              <span class="author">{m.palette.description}</span>
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
              class:matched={perfectByPalette.get(m.palette.id)?.has(ci)}
              style="background: {rgbToHex(rgb)};"
              title={rgbToHex(rgb)}
              onclick={() => copySwatch(rgb)}
            ></button>
          {/each}
        </div>
        {#if !isOwn(m.palette.id) && perfectByPalette.get(m.palette.id) && (perfectByPalette.get(m.palette.id)?.size ?? 0) > 0}
          <div class="match-info">
            <Icon name="check" size={10} />
            <b>{perfectByPalette.get(m.palette.id)?.size}</b> Treffer mit Bildfarben
          </div>
        {/if}

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

  .sticky-top {
    position: sticky;
    top: -14px;
    z-index: 5;
    background: var(--surface);
    margin: -14px -14px 12px;
    padding: 14px 14px 10px;
    border-bottom: 1px solid var(--border-strong);
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

  .hint-empty {
    padding: 8px 10px;
    background: var(--accent-soft);
    border: 1px solid var(--accent-line);
    border-radius: var(--radius-btn);
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text);
    line-height: 1.4;
    margin: 6px 0;
  }
  .lead {
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-dim);
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .threshold {
    padding: 10px 12px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .th-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .th-label {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-dim);
  }
  .th-val {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
  }
  .th-val b {
    color: var(--text);
    font-weight: 600;
  }
  .threshold input[type="range"] {
    width: 100%;
    accent-color: var(--accent);
  }
  .th-axis {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
  .matches li.own {
    border-color: var(--accent-line);
    background: var(--accent-soft);
  }
  .badge-own {
    display: inline-block;
    margin-left: 6px;
    padding: 1px 6px;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    color: var(--bg);
    background: var(--accent);
    text-transform: uppercase;
    letter-spacing: 1px;
    vertical-align: middle;
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
    transition: transform 0.08s, box-shadow 0.12s;
    position: relative;
  }
  .swatch-btn:hover {
    transform: scale(1.15);
    z-index: 1;
  }
  .swatch-btn.matched {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent);
    z-index: 1;
  }
  .match-info {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--accent);
    align-self: flex-start;
  }
  .match-info b {
    font-weight: 700;
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
