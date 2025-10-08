<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import InfoLink from "../ui/InfoLink.svelte";
  import { analysis } from "../../stores/analysis.svelte";
  import { ui } from "../../stores/ui.svelte";
  import { isLight, rgbToHex } from "../../analysis/convert";
  import {
    contrastRatio,
    wcagLabel,
    wcagLevel,
    type WcagLevel,
  } from "../../analysis/contrast";
  import type { PaletteColor } from "../../storage/schema";

  const WHITE: [number, number, number] = [255, 255, 255];
  const BLACK: [number, number, number] = [0, 0, 0];

  let maxCount = $state<number>(12);

  const shown = $derived(analysis.colors.slice(0, maxCount));

  const pairs = $derived.by(() => {
    const arr: Array<{
      a: PaletteColor;
      b: PaletteColor;
      ratio: number;
      level: WcagLevel;
    }> = [];
    for (let i = 0; i < shown.length; i++) {
      for (let j = i + 1; j < shown.length; j++) {
        const r = contrastRatio(shown[i].rgb, shown[j].rgb);
        arr.push({ a: shown[i], b: shown[j], ratio: r, level: wcagLevel(r) });
      }
    }
    arr.sort((x, y) => y.ratio - x.ratio);
    return arr;
  });

  const levelClass: Record<WcagLevel, string> = {
    AAA: "lvl-aaa",
    AA: "lvl-aa",
    "AA-Large": "lvl-aal",
    UI: "lvl-ui",
    Fail: "lvl-fail",
  };
</script>

{#if analysis.colors.length === 0}
  <div class="empty">
    <Icon name="contrast" size={32} />
    <p>Erst analysieren.</p>
    <p class="sub">Kontraste brauchen eine Farbpalette aus dem Häufigste-Tab.</p>
  </div>
{:else}
  <div class="sticky-top">
    <p class="intro">
      Prüft das
      <InfoLink topic="kontrastratio">Kontrastverhältnis</InfoLink>
      zwischen Bildfarben auf Basis der
      <InfoLink topic="luminanz">relativen Luminanz</InfoLink>
      und bewertet nach
      <InfoLink topic="wcag">WCAG 2.1</InfoLink>.
    </p>
    <div class="control">
      <label class="k" for="mc">Farben</label>
      <input
        id="mc"
        type="range"
        min="2"
        max="24"
        step="1"
        bind:value={maxCount}
      />
      <span class="n">{shown.length}</span>
    </div>
  </div>

  <section class="section">
    <h3>Lesbarkeit auf Weiß / Schwarz</h3>
    <p class="hint">
      Wie gut ist jede Bildfarbe als Text auf Weiß oder Schwarz lesbar?
    </p>
    <ul class="readable">
      {#each shown as c, i (i + "-r-" + c.hex)}
        {@const rw = contrastRatio(c.rgb, WHITE)}
        {@const rb = contrastRatio(c.rgb, BLACK)}
        {@const lw = wcagLevel(rw)}
        {@const lb = wcagLevel(rb)}
        <li>
          <span class="swatch" style="background: {c.hex};"></span>
          <span class="hex">{c.hex}</span>
          <span class="cell on-white">
            <span class="ratio">{rw.toFixed(2)}</span>
            <span class="level {levelClass[lw]}">{wcagLabel(lw)}</span>
          </span>
          <span class="cell on-black">
            <span class="ratio">{rb.toFixed(2)}</span>
            <span class="level {levelClass[lb]}">{wcagLabel(lb)}</span>
          </span>
        </li>
      {/each}
    </ul>
    <div class="legend">
      <span>Spalte 1 = auf Weiß</span><span>·</span><span>Spalte 2 = auf Schwarz</span>
    </div>
  </section>

  <section class="section">
    <h3>Beste Paare</h3>
    <p class="hint">
      Die Farbpaare aus dem Bild mit dem größten Kontrast -- Kandidaten
      für Text und Hintergrund.
    </p>
    <ul class="pairs">
      {#each pairs.slice(0, 8) as p, i (i + "-" + p.a.hex + "-" + p.b.hex)}
        <li>
          <span class="pair-swatches">
            <span class="psw" style="background: {p.a.hex};"></span>
            <span class="psw" style="background: {p.b.hex};"></span>
          </span>
          <span class="pair-hex">
            <span class="hx">{p.a.hex}</span>
            <span class="hx">{p.b.hex}</span>
          </span>
          <span class="ratio">{p.ratio.toFixed(2)}</span>
          <span class="level {levelClass[p.level]}">{wcagLabel(p.level)}</span>
        </li>
      {/each}
    </ul>
  </section>

  <section class="section legend-panel sticky-bottom">
    <h3>Stufen nach WCAG 2.1</h3>
    <p class="hint">
      Die Mindest-Kontraste nach Standard. AA ist in der EU verpflichtend.
    </p>
    <ul class="stufen">
      <li><span class="level lvl-aaa">AAA</span> <b>≥ 7:1</b> Normal-Text, höchste Stufe</li>
      <li><span class="level lvl-aa">AA</span> <b>≥ 4.5:1</b> Normal-Text, gesetzlicher Standard</li>
      <li><span class="level lvl-aal">AA Large</span> <b>≥ 3:1</b> Großtext und UI-Bedienelemente</li>
      <li><span class="level lvl-ui">UI</span> <b>≥ 1.5:1</b> nur große Flächen, nicht für Text</li>
      <li><span class="level lvl-fail">—</span> <b>&lt; 1.5:1</b> nicht ausreichend</li>
    </ul>
  </section>
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
  .sticky-bottom {
    position: sticky;
    bottom: -14px;
    z-index: 5;
    background: var(--surface);
    margin: 16px -14px -14px;
    padding: 10px 14px 14px;
    border-top: 1px solid var(--border-strong);
  }

  .intro {
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-dim);
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .control {
    display: grid;
    grid-template-columns: 60px 1fr 40px;
    gap: 10px;
    align-items: center;
  }

  .hint {
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 500;
    color: var(--text-dim);
    line-height: 1.5;
    margin: -2px 0 8px;
  }
  .hint-inline {
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-mute);
    margin: 4px 0 8px;
  }
  .control .k {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
  }
  .control .n {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    text-align: right;
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--text);
  }

  .section {
    margin-bottom: 16px;
  }
  .section h3 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-mute);
    font-weight: 600;
    padding-bottom: 6px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .readable {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .readable li {
    display: grid;
    grid-template-columns: 24px 1fr auto auto;
    gap: 8px;
    align-items: center;
    padding: 4px 6px;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .readable .swatch {
    width: 20px;
    height: 20px;
    border: 1px solid var(--border-strong);
  }
  .readable .hex {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
  }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
    padding: 3px 6px;
    min-width: 70px;
  }
  .cell.on-white { background: #ffffff; color: #000; }
  .cell.on-black { background: #000000; color: #fff; }
  .cell .ratio {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
  }
  .cell .level {
    font-family: var(--font-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
  }
  .cell.on-white .level { color: #fff; }
  .cell.on-black .level { color: #fff; }

  .legend {
    display: flex;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-mute);
    margin-top: 4px;
  }

  .pairs {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .pairs li {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 8px;
    align-items: center;
    padding: 4px 8px;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .pair-swatches {
    display: inline-flex;
    gap: 2px;
  }
  .psw {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 1px solid var(--border-strong);
  }
  .pair-hex {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .pair-hex .hx {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text);
  }
  .pairs .ratio {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    font-weight: 600;
  }

  .level {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 2px;
  }
  .lvl-aaa { background: #16a34a; color: #fff; }
  .lvl-aa { background: #22c55e; color: #0b0b0d; }
  .lvl-aal { background: #eab308; color: #0b0b0d; }
  .lvl-ui { background: #a16207; color: #fff; }
  .lvl-fail { background: #7f1d1d; color: #fff; }

  .legend-panel .stufen {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .legend-panel li {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 8px;
    align-items: center;
    font-family: var(--font-button);
    font-size: 12px;
    color: var(--text-dim);
  }
  .legend-panel b {
    font-family: var(--font-mono);
    color: var(--text);
    font-size: 11px;
  }
</style>
