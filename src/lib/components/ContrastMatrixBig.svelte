<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import InfoLink from "./ui/InfoLink.svelte";
  import { analysis } from "../stores/analysis.svelte";
  import { ui } from "../stores/ui.svelte";
  import {
    contrastRatio,
    wcagLabel,
    wcagLevel,
    type WcagLevel,
  } from "../analysis/contrast";
  import type { PaletteColor } from "../storage/schema";

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

<section class="big-matrix">
  <header>
    <div class="head-left">
      <Icon name="contrast" size={16} />
      <h3>WCAG-Kontrast</h3>
    </div>
    <div class="head-right">
      <label class="k" for="bm">Farben</label>
      <input id="bm" type="range" min="2" max="24" step="1" bind:value={maxCount} />
      <span class="n">{shown.length}</span>
      <button
        type="button"
        class="close"
        title="Kontrastmatrix schließen"
        onclick={() => ui.setLeft("gallery")}
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  </header>

  <div class="scroll">
    <section class="sec">
      <p class="intro">
        Prüft das
        <InfoLink topic="kontrastratio">Kontrastverhältnis</InfoLink>
        zwischen Bildfarben auf Basis der
        <InfoLink topic="luminanz">relativen Luminanz</InfoLink>
        und bewertet nach
        <InfoLink topic="wcag">WCAG 2.1</InfoLink>.
        Grün = AAA, Hellgrün = AA, Gelb = AA Large, Braun = UI-Mindest, Rot = nicht ausreichend.
      </p>
    </section>

    {#if shown.length > 0}
      <section class="sec">
        <h4>Lesbarkeit auf Weiß und Schwarz</h4>
        <p class="hint">
          Zeigt für jede Bildfarbe, wie gut sie als Text auf einem weißen
          bzw. schwarzen Hintergrund lesbar wäre. Mindestens AA muss sein,
          sonst wird der Text für viele schwer lesbar.
        </p>
        <ul class="readable">
          {#each shown as c, i (i)}
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
      </section>

      <section class="sec">
        <h4>Matrix</h4>
        <p class="hint">
          Jede Zelle zeigt das Kontrastverhältnis eines Farbpaars. Ziel:
          gute Kombinationen aus dem eigenen Bild finden, etwa Text auf
          Hintergrund. Je heller-grün, desto besser lesbar.
        </p>
        <div class="mt-wrap">
          <table class="mt">
            <thead>
              <tr>
                <th class="corner"></th>
                {#each shown as c, ci (ci)}
                  <th>
                    <span class="sw" style="background: {c.hex};"></span>
                    <span class="hex">{c.hex}</span>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each shown as row, i (i)}
                <tr>
                  <th>
                    <span class="sw" style="background: {row.hex};"></span>
                    <span class="hex">{row.hex}</span>
                  </th>
                  {#each shown as col, j (i + "-" + j)}
                    {@const r = i === j ? 0 : contrastRatio(row.rgb, col.rgb)}
                    {@const lv = i === j ? "Fail" : wcagLevel(r)}
                    <td class={i === j ? "diag" : levelClass[lv]}>
                      {#if i !== j}
                        <span class="rat">{r.toFixed(2)}</span>
                        <span class="lv">{wcagLabel(lv)}</span>
                      {/if}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec">
        <h4>Beste Paare</h4>
        <p class="hint">
          Farbpaare aus dem Bild mit dem höchsten Kontrastverhältnis --
          Kandidaten für Text/Hintergrund-Kombinationen, die direkt aus
          der vorhandenen Bildpalette stammen.
        </p>
        <ul class="pairs">
          {#each pairs.slice(0, 10) as p, i (i)}
            <li>
              <span class="pair-sw">
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

      <section class="sec legend">
        <h4>Stufen nach WCAG 2.1</h4>
        <p class="hint">
          Welchen Kontrast eine Kombination mindestens haben muss, damit
          sie für möglichst viele Menschen gut lesbar ist. AA ist der
          gesetzliche Standard für Webseiten in Deutschland und der EU.
        </p>
        <ul class="stufen">
          <li><span class="level lvl-aaa">AAA</span> <b>&ge; 7:1</b> Normal-Text, höchste Stufe</li>
          <li><span class="level lvl-aa">AA</span> <b>&ge; 4.5:1</b> Normal-Text, gesetzlicher Standard</li>
          <li><span class="level lvl-aal">AA Large</span> <b>&ge; 3:1</b> Großtext und UI-Bedienelemente</li>
          <li><span class="level lvl-ui">UI</span> <b>&ge; 1.5:1</b> nur große Flächen, nicht für Text</li>
          <li><span class="level lvl-fail">&mdash;</span> <b>&lt; 1.5:1</b> nicht ausreichend</li>
        </ul>
      </section>
    {:else}
      <div class="empty">Erst analysieren, um Kontraste zu berechnen.</div>
    {/if}
  </div>
</section>

<style>
  .big-matrix {
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 0;
    border-top: 1px solid var(--border);
    background: var(--surface);
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-bottom: 1px solid var(--border);
    gap: 12px;
  }
  .head-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text);
  }
  .head-left h3 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
  }
  .head-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .head-right .k {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }
  .head-right input[type="range"] {
    width: 160px;
    accent-color: var(--text);
  }
  .head-right .n {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    min-width: 26px;
    text-align: right;
  }
  .close {
    width: 26px;
    height: 26px;
    border: 0;
    background: transparent;
    color: var(--text-dim);
    cursor: pointer;
    display: grid;
    place-items: center;
    border-radius: 3px;
  }
  .close:hover {
    color: var(--text);
    background: var(--surface-2);
  }

  .scroll {
    overflow: auto;
    padding: 14px 14px 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .sec h4 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-mute);
    font-weight: 600;
    padding-bottom: 6px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .intro {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-dim);
    line-height: 1.55;
    margin: 0;
  }
  .hint {
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-dim);
    line-height: 1.5;
    margin: -4px 0 10px;
  }

  .empty {
    padding: 40px;
    text-align: center;
    color: var(--text-mute);
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .readable {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 4px;
  }
  .readable li {
    display: grid;
    grid-template-columns: 28px 1fr auto auto;
    gap: 10px;
    align-items: center;
    padding: 5px 8px;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .readable .swatch {
    width: 24px;
    height: 24px;
    border: 1px solid var(--border-strong);
  }
  .readable .hex {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
  }
  .readable .cell {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
    padding: 4px 8px;
    min-width: 84px;
  }
  .readable .cell.on-white { background: #ffffff; color: #000; }
  .readable .cell.on-black { background: #000000; color: #fff; }
  .readable .cell .ratio {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
  }
  .readable .cell .level {
    font-family: var(--font-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    color: #fff;
  }

  .mt-wrap {
    overflow: auto;
    border: 1px solid var(--border);
  }
  .mt {
    border-collapse: collapse;
    font-family: var(--font-mono);
  }
  .mt th,
  .mt td {
    padding: 0;
    border: 1px solid var(--border);
    text-align: center;
    vertical-align: middle;
  }
  .mt thead th,
  .mt tbody th {
    background: var(--surface-2);
    padding: 4px 6px;
    min-width: 70px;
  }
  .mt thead th .sw,
  .mt tbody th .sw {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 1px solid var(--border-strong);
    vertical-align: middle;
  }
  .mt thead th .hex,
  .mt tbody th .hex {
    display: inline-block;
    margin-left: 4px;
    font-size: 10px;
    color: var(--text);
    vertical-align: middle;
  }
  .mt .corner {
    background: var(--surface);
  }
  .mt td {
    width: 64px;
    height: 44px;
    font-size: 10px;
    color: var(--text);
  }
  .mt td .rat {
    display: block;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.1;
  }
  .mt td .lv {
    display: block;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.9;
  }
  .mt td.diag {
    background: repeating-linear-gradient(45deg, var(--surface-2) 0 4px, transparent 4px 8px);
  }

  .pairs {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 4px;
  }
  .pairs li {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 10px;
    align-items: center;
    padding: 5px 10px;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .pair-sw {
    display: inline-flex;
    gap: 2px;
  }
  .psw {
    display: inline-block;
    width: 20px;
    height: 20px;
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
    font-size: 12px;
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
    color: #fff;
  }
  .lvl-aaa { background: #16a34a; }
  .lvl-aa { background: #22c55e; color: #0b0b0d; }
  .lvl-aal { background: #eab308; color: #0b0b0d; }
  .lvl-ui { background: #a16207; }
  .lvl-fail { background: #7f1d1d; }

  .mt td.lvl-aaa { background: rgba(22, 163, 74, 0.5); color: #fff; }
  .mt td.lvl-aa { background: rgba(34, 197, 94, 0.4); color: #fff; }
  .mt td.lvl-aal { background: rgba(234, 179, 8, 0.35); color: #fff; }
  .mt td.lvl-ui { background: rgba(161, 98, 7, 0.4); color: #fff; }
  .mt td.lvl-fail { background: rgba(127, 29, 29, 0.45); color: var(--text-dim); }

  .legend .stufen {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 6px;
  }
  .legend li {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 10px;
    align-items: center;
    font-family: var(--font-button);
    font-size: 13px;
    color: var(--text-dim);
  }
  .legend b {
    font-family: var(--font-mono);
    color: var(--text);
    font-size: 11px;
  }
</style>
