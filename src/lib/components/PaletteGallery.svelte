<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { listBuiltinPalettes } from "../palettes/builtin";
  import { rgbToHex } from "../analysis/convert";

  type Tab = "builtin" | "own";
  let activeTab = $state<Tab>("builtin");

  const builtinPalettes = listBuiltinPalettes();
</script>

<div class="pal-gallery">
  <div class="toolbar">
    <div class="title">
      <Icon name="palette" size={14} />
      <b>Paletten</b>
      <span class="sub">Sammlungen für Matching, Snap und Export</span>
    </div>
    <div class="tabs" role="tablist">
      <button
        type="button"
        class="tab"
        class:active={activeTab === "builtin"}
        role="tab"
        onclick={() => (activeTab = "builtin")}
      >
        Fertige
        <span class="count">{builtinPalettes.length}</span>
      </button>
      <button
        type="button"
        class="tab"
        class:active={activeTab === "own"}
        role="tab"
        onclick={() => (activeTab = "own")}
      >
        Eigene
        <span class="count">0</span>
      </button>
    </div>
  </div>

  <div class="body">
    {#if activeTab === "builtin"}
      <p class="intro">
        Eingebaute Design-Systeme und klassische Paletten. Nutzbar für
        Paletten-Matching, Snap-to-Palette und als Referenz. Klick auf
        eine Kachel blendet die Farben vergrößert ein.
      </p>
      <div class="grid">
        {#each builtinPalettes as pal (pal.id)}
          <article class="card">
            <header>
              <h3>{pal.name}</h3>
              {#if pal.author}<span class="author">{pal.author}</span>{/if}
            </header>
            <div class="swatches">
              {#each pal.colors as rgb, i (i)}
                <span class="sw" style="background: {rgbToHex(rgb)};" title={rgbToHex(rgb)}></span>
              {/each}
            </div>
            <footer>
              <span class="n">{pal.colors.length} Farben</span>
              {#if pal.description}
                <span class="desc">{pal.description}</span>
              {/if}
            </footer>
          </article>
        {/each}
      </div>
    {:else}
      <div class="empty">
        <Icon name="palette" size={48} />
        <h3>Noch keine eigenen Paletten</h3>
        <p>
          Hier landen Paletten, die du selbst anlegst oder aus Analysen
          speicherst -- z. B. die häufigsten Farben eines Lieblingsbildes,
          eine kuratierte Auswahl aus der Seltenste-Liste oder importierte
          GIMP-, CSS- oder JSON-Paletten. Die Verwaltung wird gerade
          vorbereitet.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .pal-gallery {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
  }
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    gap: 14px;
    height: 48px;
  }
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-dim);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .title b {
    color: var(--text);
    font-weight: 600;
  }
  .title .sub {
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-mute);
    text-transform: none;
    letter-spacing: 0;
    margin-left: 8px;
  }

  .tabs {
    display: inline-flex;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    border-radius: 3px;
    overflow: hidden;
  }
  .tab {
    background: transparent;
    border: 0;
    color: var(--text-dim);
    padding: 6px 14px;
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .tab + .tab {
    border-left: 1px solid var(--border-strong);
  }
  .tab:hover {
    color: var(--text);
  }
  .tab.active {
    background: var(--text);
    color: var(--bg);
  }
  .tab .count {
    font-family: var(--font-mono);
    font-size: 10px;
    opacity: 0.75;
  }

  .body {
    flex: 1;
    overflow: auto;
    padding: 16px;
  }
  .intro {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-dim);
    margin: 0 0 14px;
    line-height: 1.5;
    max-width: 780px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 12px;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color 0.12s;
  }
  .card:hover {
    border-color: var(--border-strong);
  }
  .card header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .card h3 {
    font-family: var(--font-button);
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .card .author {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-mute);
    letter-spacing: 0.5px;
  }
  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    align-items: center;
  }
  .swatches .sw {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 1px solid var(--border-strong);
  }
  .card footer {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }
  .card .n {
    color: var(--text);
    font-weight: 500;
  }
  .card .desc {
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-mute);
    text-transform: none;
    letter-spacing: 0;
  }

  .empty {
    max-width: 520px;
    margin: 40px auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    color: var(--text-dim);
  }
  .empty :global(.ic) {
    color: var(--text-mute);
  }
  .empty h3 {
    font-family: var(--font-button);
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }
  .empty p {
    font-family: var(--font-button);
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-dim);
  }
</style>
