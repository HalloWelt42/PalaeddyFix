<script lang="ts">
  import { gallery } from "../stores/gallery.svelte";
  import { selection } from "../stores/selection.svelte";
  import Icon from "./ui/Icon.svelte";

  async function handleSelect(id: string): Promise<void> {
    await selection.select(id);
  }

  async function handleTogglePin(id: string, e: MouseEvent): Promise<void> {
    e.stopPropagation();
    await gallery.togglePin(id);
  }

  async function handleDelete(id: string, e: MouseEvent): Promise<void> {
    e.stopPropagation();
    if (selection.id === id) await selection.select(null);
    await gallery.remove(id);
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<div class="grid">
  {#each gallery.items as item (item.id)}
    <div
      role="button"
      tabindex="0"
      class="tile"
      class:selected={selection.id === item.id}
      onclick={() => handleSelect(item.id)}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void handleSelect(item.id);
        }
      }}
      title={item.name}
    >
      <img class="thumb" src={item.thumbUrl} alt={item.name} draggable="false" />
      <button
        type="button"
        class="pin"
        class:on={item.pinned}
        onclick={(e) => handleTogglePin(item.id, e)}
        title={item.pinned ? "Favorit entfernen" : "Als Favorit markieren"}
      >
        <Icon name="star" size={12} />
      </button>
      <button
        type="button"
        class="del"
        onclick={(e) => handleDelete(item.id, e)}
        title="Löschen"
      >
        <Icon name="trash" size={12} />
      </button>
      <div class="meta">
        <span class="name">{item.name}</span>
        <span class="num">{item.width}×{item.height} · {formatSize(item.size)}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .grid {
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
  .tile {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    aspect-ratio: 4 / 3;
    cursor: pointer;
    overflow: hidden;
    padding: 0;
    font-family: inherit;
    text-align: left;
    color: inherit;
    display: block;
  }
  .tile:hover {
    border-color: var(--border-strong);
  }
  .tile.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent) inset;
  }
  .thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    background: var(--bg);
  }
  .pin,
  .del {
    position: absolute;
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    display: grid;
    place-items: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.1s;
  }
  .tile:hover .pin,
  .tile:hover .del,
  .pin.on {
    opacity: 1;
  }
  .pin {
    top: 6px;
    right: 6px;
  }
  .pin.on {
    color: #ffd166;
  }
  .del {
    top: 6px;
    left: 6px;
  }
  .del:hover {
    background: #dc2626;
  }
  .meta {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 6px 8px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8) 60%);
    font-family: var(--font-mono);
    font-size: 10px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    gap: 6px;
  }
  .meta .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .meta .num {
    flex-shrink: 0;
    opacity: 0.8;
  }
</style>
