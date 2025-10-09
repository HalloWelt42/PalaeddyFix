<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import InfoLink from "./ui/InfoLink.svelte";
  import PromptModal from "./ui/PromptModal.svelte";
  import { listBuiltinPalettes } from "../palettes/builtin";
  import { rgbToHex } from "../analysis/convert";
  import { palettes } from "../stores/palettes.svelte";
  import type { PaletteSource } from "../storage/schema";

  type Tab = "builtin" | "own";
  let activeTab = $state<Tab>("builtin");

  const builtinPalettes = listBuiltinPalettes();

  let collapsed = $state<Set<string>>(loadCollapsed());

  function loadCollapsed(): Set<string> {
    try {
      const raw = localStorage.getItem("palettes-collapsed");
      if (!raw) return new Set();
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set();
    }
  }

  function saveCollapsed(): void {
    try {
      localStorage.setItem("palettes-collapsed", JSON.stringify([...collapsed]));
    } catch {
      /* ignore */
    }
  }

  function toggleCollapsed(id: string): void {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    collapsed = next;
    saveCollapsed();
  }

  function expandAll(): void {
    collapsed = new Set();
    saveCollapsed();
  }

  function collapseAll(ids: string[]): void {
    collapsed = new Set([...collapsed, ...ids]);
    saveCollapsed();
  }

  const sourceLabel: Record<PaletteSource, string> = {
    "analysis-frequent": "Häufigste",
    "analysis-rare": "Seltenste",
    manual: "Manuell",
    snapshot: "Snapshot",
  };

  const ownSorted = $derived(
    [...palettes.items].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    }),
  );

  const GROUP_ORDER: PaletteSource[] = [
    "analysis-frequent",
    "analysis-rare",
    "manual",
    "snapshot",
  ];

  const ownGrouped = $derived.by(() => {
    const map = new Map<PaletteSource, typeof ownSorted>();
    for (const source of GROUP_ORDER) map.set(source, []);
    for (const pal of ownSorted) {
      const arr = map.get(pal.source) ?? [];
      arr.push(pal);
      map.set(pal.source, arr);
    }
    return GROUP_ORDER
      .map((source) => ({ source, label: sourceLabel[source], items: map.get(source) ?? [] }))
      .filter((g) => g.items.length > 0);
  });

  let renameOpen = $state<boolean>(false);
  let renameId = $state<string>("");
  let renameInitial = $state<string>("");

  let deleteOpen = $state<boolean>(false);
  let deleteId = $state<string>("");
  let deleteMessage = $state<string>("");

  function onRename(id: string, current: string): void {
    renameId = id;
    renameInitial = current;
    renameOpen = true;
  }

  async function confirmRename(value: string): Promise<void> {
    if (value) await palettes.rename(renameId, value);
    renameOpen = false;
  }

  function onDelete(id: string, name: string): void {
    deleteId = id;
    deleteMessage = `Palette „${name}" unwiderruflich löschen?`;
    deleteOpen = true;
  }

  async function confirmDelete(): Promise<void> {
    await palettes.remove(deleteId);
    deleteOpen = false;
  }

  function formatDate(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number): string => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
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
        <span class="count">{palettes.items.length}</span>
      </button>
    </div>
  </div>

  <div class="body">
    {#if activeTab === "builtin"}
      <p class="intro">
        Eingebaute Design-Systeme und klassische Paletten. Nutzbar für
        Paletten-Matching, Snap-to-Palette und als Referenz. Nicht benötigte
        Paletten kannst du einklappen, um den Vergleich übersichtlich zu halten.
      </p>
      <div class="compare-bar">
        <button type="button" class="compare-btn" onclick={expandAll}>
          Alle ausklappen
        </button>
        <button
          type="button"
          class="compare-btn"
          onclick={() => collapseAll(builtinPalettes.map((p) => p.id))}
        >
          Alle einklappen
        </button>
        <span class="compare-meta">
          {builtinPalettes.length - builtinPalettes.filter((p) => collapsed.has(p.id)).length}
          von {builtinPalettes.length} sichtbar
        </span>
      </div>
      <div class="grid">
        {#each builtinPalettes as pal (pal.id)}
          {@const isCollapsed = collapsed.has(pal.id)}
          <article class="card" class:collapsed={isCollapsed}>
            <header>
              <button
                type="button"
                class="collapse-btn"
                title={isCollapsed ? "Ausklappen" : "Einklappen"}
                onclick={() => toggleCollapsed(pal.id)}
                aria-expanded={!isCollapsed}
              >
                <Icon name={isCollapsed ? "plus" : "x"} size={10} />
              </button>
              <div class="name-row">
                <h3>
                  {#if pal.infoTopic}
                    <InfoLink topic={pal.infoTopic}>{pal.name}</InfoLink>
                  {:else}
                    {pal.name}
                  {/if}
                </h3>
              </div>
              {#if pal.author && !isCollapsed}<span class="author">{pal.author}</span>{/if}
            </header>
            {#if !isCollapsed}
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
            {/if}
          </article>
        {/each}
      </div>
    {:else if ownSorted.length === 0}
      <div class="empty">
        <Icon name="palette" size={48} />
        <h3>Noch keine eigenen Paletten</h3>
        <p>
          In der Analyse findest du einen Button <b>Als Palette speichern</b> --
          damit legst du die aktuelle Farbauswahl hier ab. Du kannst sie später
          umbenennen, anpinnen oder wieder löschen.
        </p>
      </div>
    {:else}
      <p class="intro">
        Selbst gespeicherte Paletten, gruppiert nach Analyse-Typ. Gepinnte
        stehen innerhalb der Gruppe oben. Klick auf den Stift benennt um,
        das Stern-Icon pinnt, der Mülleimer löscht. Farben einzeln per Klick
        löschen, Karten einklappen zum Vergleichen.
      </p>
      <div class="compare-bar">
        <button type="button" class="compare-btn" onclick={expandAll}>
          Alle ausklappen
        </button>
        <button
          type="button"
          class="compare-btn"
          onclick={() => collapseAll(ownSorted.map((p) => p.id))}
        >
          Alle einklappen
        </button>
        <span class="compare-meta">
          {ownSorted.length - ownSorted.filter((p) => collapsed.has(p.id)).length}
          von {ownSorted.length} sichtbar
        </span>
      </div>
      {#each ownGrouped as g (g.source)}
        <section class="own-group">
          <h2 class="group-head">
            <span>{g.label}</span>
            <span class="group-count">{g.items.length}</span>
          </h2>
          <div class="grid">
            {#each g.items as pal (pal.id)}
          {@const isCollapsed = collapsed.has(pal.id)}
          <article class="card" class:pinned={pal.pinned} class:collapsed={isCollapsed}>
            <header>
              <button
                type="button"
                class="collapse-btn"
                title={isCollapsed ? "Ausklappen" : "Einklappen"}
                onclick={() => toggleCollapsed(pal.id)}
                aria-expanded={!isCollapsed}
              >
                <Icon name={isCollapsed ? "plus" : "x"} size={10} />
              </button>
              <div class="name-row">
                <h3>{pal.name}</h3>
                {#if !isCollapsed}<span class="src">{sourceLabel[pal.source]}</span>{/if}
              </div>
              {#if !isCollapsed}
                <div class="own-actions">
                  <button
                    type="button"
                    class="mini"
                    title={pal.pinned ? "Pin entfernen" : "Anpinnen"}
                    onclick={() => void palettes.togglePin(pal.id)}
                  >
                    <Icon name="star" size={12} />
                  </button>
                  <button
                    type="button"
                    class="mini"
                    title="Umbenennen"
                    onclick={() => void onRename(pal.id, pal.name)}
                  >
                    <Icon name="tag" size={12} />
                  </button>
                  <button
                    type="button"
                    class="mini danger"
                    title="Löschen"
                    onclick={() => void onDelete(pal.id, pal.name)}
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              {/if}
            </header>
            {#if !isCollapsed}
            <div class="swatches own">
              {#each pal.colors as rgb, i (i + "-" + rgbToHex(rgb))}
                <button
                  type="button"
                  class="sw sw-del"
                  style="background: {rgbToHex(rgb)};"
                  title="{rgbToHex(rgb)} – Klick entfernt diese Farbe"
                  onclick={() => void palettes.removeColorAt(pal.id, i)}
                  aria-label="Farbe {rgbToHex(rgb)} entfernen"
                ></button>
              {/each}
            </div>
            <footer>
              <span class="n">{pal.colors.length} Farben</span>
              <span class="desc">{formatDate(pal.createdAt)}</span>
            </footer>
            {/if}
          </article>
            {/each}
          </div>
        </section>
      {/each}
    {/if}
  </div>
</div>

<PromptModal
  open={renameOpen}
  title="Palette umbenennen"
  label="Name"
  defaultValue={renameInitial}
  confirmLabel="Umbenennen"
  onConfirm={confirmRename}
  onCancel={() => (renameOpen = false)}
/>

<PromptModal
  open={deleteOpen}
  title="Palette löschen?"
  mode="confirm"
  message={deleteMessage}
  danger={true}
  confirmLabel="Löschen"
  onConfirm={confirmDelete}
  onCancel={() => (deleteOpen = false)}
/>

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

  .own-group {
    margin-bottom: 18px;
  }
  .group-head {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 700;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin: 0 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
    width: 100%;
  }
  .group-count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-mute);
    font-weight: 500;
    letter-spacing: 0;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 12px;
  }
  .compare-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding: 6px 0;
  }
  .compare-btn {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text-dim);
    padding: 4px 10px;
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 600;
    border-radius: var(--radius-btn);
    cursor: pointer;
  }
  .compare-btn:hover {
    border-color: var(--text-dim);
    color: var(--text);
  }
  .compare-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-mute);
    margin-left: auto;
  }
  .collapse-btn {
    width: 18px;
    height: 18px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-dim);
    cursor: pointer;
    display: grid;
    place-items: center;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .collapse-btn:hover {
    border-color: var(--text-dim);
    color: var(--text);
    background: var(--surface-2);
  }
  .card.collapsed {
    padding: 6px 10px;
    gap: 4px;
  }
  .card.collapsed header {
    align-items: center;
  }
  .card.collapsed h3 {
    font-size: 12px;
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
  .name-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .src {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .own-actions {
    display: inline-flex;
    gap: 2px;
  }
  .mini {
    width: 22px;
    height: 22px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-dim);
    display: grid;
    place-items: center;
    border-radius: 3px;
    cursor: pointer;
  }
  .mini:hover {
    background: var(--surface-2);
    border-color: var(--border);
    color: var(--text);
  }
  .mini.danger:hover {
    color: #ef4444;
  }
  .card.pinned {
    border-color: var(--accent-line);
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
  .swatches .sw-del {
    cursor: pointer;
    padding: 0;
    position: relative;
    transition: transform 0.12s;
  }
  .swatches .sw-del:hover {
    transform: scale(1.2);
    z-index: 1;
    box-shadow: 0 0 0 2px var(--err);
  }
  .swatches .sw-del:hover::after {
    content: "×";
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    text-shadow: 0 0 3px #000;
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
