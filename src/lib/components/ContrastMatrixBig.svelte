<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { analysis } from "../stores/analysis.svelte";
  import { ui } from "../stores/ui.svelte";
  import {
    contrastRatio,
    wcagLabel,
    wcagLevel,
    type WcagLevel,
  } from "../analysis/contrast";

  let maxCount = $state<number>(12);

  const shown = $derived(analysis.colors.slice(0, maxCount));

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
      <h3>Kontrastmatrix</h3>
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
    {#if shown.length > 0}
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
    padding: 14px;
  }

  .empty {
    padding: 40px;
    text-align: center;
    color: var(--text-mute);
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .mt-wrap {
    overflow: auto;
    border: 1px solid var(--border);
    display: inline-block;
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

  .mt td.lvl-aaa { background: rgba(22, 163, 74, 0.5); color: #fff; }
  .mt td.lvl-aa { background: rgba(34, 197, 94, 0.4); color: #fff; }
  .mt td.lvl-aal { background: rgba(234, 179, 8, 0.35); color: #fff; }
  .mt td.lvl-ui { background: rgba(161, 98, 7, 0.4); color: #fff; }
  .mt td.lvl-fail { background: rgba(127, 29, 29, 0.45); color: var(--text-dim); }
</style>
