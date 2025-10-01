<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import Gallery from "./Gallery.svelte";
  import Viewer from "./Viewer.svelte";
  import { dropzone } from "../import/dropzone";
  import { ingestFiles } from "../import/fileIntake";
  import { gallery } from "../stores/gallery.svelte";
  import { selection } from "../stores/selection.svelte";

  let fileInput = $state<HTMLInputElement | null>(null);
  let importing = $state<boolean>(false);
  let query = $state<string>("");

  const visibleItems = $derived(
    query.trim() === ""
      ? gallery.items
      : gallery.items.filter((i) =>
          i.name.toLowerCase().includes(query.toLowerCase()),
        ),
  );

  async function handleFiles(files: File[]): Promise<void> {
    importing = true;
    try {
      const images = await ingestFiles(files);
      if (images.length > 0) {
        await gallery.addMany(images);
        await selection.select(images[0].id);
      }
    } finally {
      importing = false;
    }
  }

  function openPicker(): void {
    fileInput?.click();
  }

  async function onInputChange(e: Event): Promise<void> {
    const input = e.currentTarget as HTMLInputElement;
    if (input.files) {
      await handleFiles(Array.from(input.files));
      input.value = "";
    }
  }
</script>

<main class="main" use:dropzone={{ onFiles: handleFiles }}>
  {#if selection.id}
    <Viewer />
  {:else}
    <div class="toolbar">
      <div class="group">
        <span class="title">
          <b>Galerie</b> /
          {#if gallery.items.length === 0}Leer{:else}{gallery.items.length} Bilder{/if}
        </span>
      </div>
      <div class="group">
        <div class="search">
          <Icon name="search" size={12} />
          <input type="text" placeholder="Suchen ..." bind:value={query} />
        </div>
        <button class="btn btn-icon" onclick={openPicker} title="Dateien öffnen" type="button">
          <Icon name="plus" size={14} />
        </button>
      </div>
    </div>

    <div class="body">
      {#if gallery.items.length === 0}
        <div class="drop" class:importing>
          <div class="inner">
            <div class="glyph">
              <Icon name="upload" size={36} />
            </div>
            <h2>Bilder hier ablegen</h2>
            <div class="sub">Screenshots, PNG, JPG, WEBP, GIF, BMP -- lokal, ohne Upload.</div>
            <button class="btn btn-primary" type="button" onclick={openPicker}>
              Dateien auswählen
            </button>
            <div class="hints">
              <span><kbd>⌘</kbd><kbd>V</kbd> Einfügen</span>
              <span><kbd>⌘</kbd><kbd>O</kbd> Datei öffnen</span>
              <span><kbd>⇧</kbd><kbd>⌘</kbd><kbd>4</kbd> Screenshot</span>
            </div>
          </div>
        </div>
      {:else if visibleItems.length === 0}
        <div class="empty">
          <p>Keine Treffer für „{query}".</p>
        </div>
      {:else}
        <Gallery />
      {/if}
    </div>
  {/if}

  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    multiple
    style="display: none;"
    onchange={onInputChange}
  />
</main>

<style>
  .main {
    background: var(--bg);
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    position: relative;
  }
  .main:global(.is-drag-hover)::after {
    content: "";
    position: absolute;
    inset: 6px;
    border: 2px dashed var(--accent);
    pointer-events: none;
    z-index: 10;
  }

  .toolbar {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    gap: 8px;
    flex-shrink: 0;
  }
  .group {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .title {
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 500;
  }
  .title :global(b) {
    color: var(--text);
  }
  .search {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .search :global(svg) {
    position: absolute;
    left: 8px;
    color: var(--text-mute);
  }
  .search input {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 5px 10px 5px 28px;
    font-family: var(--font-mono);
    font-size: 11px;
    border-radius: 3px;
    width: 200px;
    outline: none;
  }
  .search input:focus {
    border-color: var(--accent-line);
  }

  .body {
    flex: 1;
    overflow: auto;
    position: relative;
  }

  .drop {
    position: absolute;
    inset: 20px;
    border: 2px dashed var(--border-strong);
    display: grid;
    place-items: center;
    text-align: center;
    color: var(--text-dim);
    background:
      linear-gradient(var(--surface) 1px, transparent 1px) 0 0 / 24px 24px,
      linear-gradient(90deg, var(--surface) 1px, transparent 1px) 0 0 / 24px 24px,
      var(--bg);
    transition: border-color 0.15s, color 0.15s;
  }
  .drop.importing {
    opacity: 0.6;
    pointer-events: none;
  }

  .inner {
    max-width: 520px;
  }
  .glyph {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    display: grid;
    place-items: center;
    border: 2px solid currentColor;
    border-radius: 50%;
  }
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .sub {
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 20px;
  }
  .hints {
    display: flex;
    justify-content: center;
    gap: 24px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-mute);
    letter-spacing: 0.5px;
    margin-top: 24px;
  }
  .hints kbd {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    padding: 2px 6px;
    border-radius: 3px;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 10px;
    margin-right: 4px;
  }

  .empty {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--text-mute);
    font-family: var(--font-mono);
    font-size: 12px;
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
  .btn-primary:hover {
    opacity: 0.9;
  }
  .btn-icon {
    width: 30px;
    height: 30px;
    padding: 0;
    display: grid;
    place-items: center;
    background: transparent;
    border-color: transparent;
    color: var(--text-dim);
  }
  .btn-icon:hover {
    color: var(--text);
    background: var(--surface-2);
  }
</style>
