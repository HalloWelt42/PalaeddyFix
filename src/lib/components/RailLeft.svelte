<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import type { IconName } from "./ui/Icon.svelte";
  import { gallery } from "../stores/gallery.svelte";
  import { ui } from "../stores/ui.svelte";
  import type { LeftTab } from "../stores/ui.svelte";

  type RailItem = {
    key: LeftTab;
    name: IconName;
    title: string;
    badge?: () => string | undefined;
  };

  const top: RailItem[] = [
    { key: "drop", name: "upload", title: "Bild öffnen / ablegen" },
    { key: "gallery", name: "grid", title: "Galerie", badge: () => String(gallery.items.length) },
    { key: "palettes", name: "palette", title: "Paletten" },
    { key: "contrast", name: "contrast", title: "Kontrastmatrix" },
  ];
</script>

<aside class="rail left">
  <div class="group">
    {#each top as item (item.key)}
      {@const open = ui.activeLeft === item.key}
      <button
        class="rail-btn"
        class:active={open}
        title={open ? `${item.title} schließen` : item.title}
        type="button"
        onclick={() => ui.toggleLeft(item.key)}
      >
        <Icon name={item.name} size={18} />
        {#if item.badge && item.badge() && Number(item.badge()) > 0}<span class="badge">{item.badge()}</span>{/if}
      </button>
    {/each}
  </div>
  <div class="group">
    <button
      class="rail-btn"
      title="Einstellungen"
      type="button"
      onclick={() => ui.openSettings()}
    >
      <Icon name="settings" size={18} />
    </button>
  </div>
</aside>

<style>
  .rail {
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
  }
  .group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .rail-btn {
    width: 40px;
    height: 40px;
    border: 0;
    background: transparent;
    color: var(--text-dim);
    cursor: pointer;
    display: grid;
    place-items: center;
    position: relative;
    border-radius: var(--radius-btn);
  }
  .rail-btn:hover {
    color: var(--text);
    background: var(--surface-2);
  }
  .rail-btn.active {
    color: var(--text);
    background: var(--accent-soft);
  }
  .rail-btn.active::after {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: var(--accent);
  }
  .badge {
    position: absolute;
    top: 4px;
    right: 4px;
    background: var(--text);
    color: var(--bg);
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    padding: 1px 4px;
    min-width: 14px;
    text-align: center;
    line-height: 1.2;
  }
</style>
