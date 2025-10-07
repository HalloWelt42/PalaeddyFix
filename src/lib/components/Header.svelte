<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { selection } from "../stores/selection.svelte";
  import { gallery } from "../stores/gallery.svelte";
  import { ui } from "../stores/ui.svelte";

  type Props = {
    onOpenPicker?: () => void;
  };

  const { onOpenPicker }: Props = $props();

  const currentItem = $derived(gallery.items.find((i) => i.id === selection.id));

  const primary = $derived(selection.id && currentItem ? "Detail" : "Galerie");
  const secondary = $derived(currentItem ? currentItem.name : "---");

  const brand = "PaläddyFix";
  const brandChars: string[] = Array.from(brand);
  const hueStep = 360 / brandChars.length;
  const hueStart = 29;
</script>

<header class="header">
  <div class="logo">
    <span class="logo-mark">
      <Icon name="palette" size={27} />
    </span>
    <div class="logo-name" aria-label={brand}>
      {#each brandChars as ch, i (i)}
        {#if ch === "l"}
          <span style="color: oklch(0.88 0.2 100);">{ch}</span>
        {:else}
          <span style="color: oklch(0.62 0.26 {((i * hueStep + hueStart) % 360).toFixed(1)});">{ch}</span>
        {/if}
      {/each}
    </div>
  </div>
  <div class="header-center">
    <div class="crumbs">
      <span>{primary}</span> <b>/</b> <span class="secondary">{secondary}</span>
    </div>
  </div>
  <div class="header-right">
    <button
      class="btn btn-ghost"
      title="Neues Bild öffnen"
      type="button"
      onclick={() => onOpenPicker?.()}
    >
      <Icon name="plus" size={14} /> Neu
    </button>
    <span class="sep"></span>
    <button
      class="btn btn-ghost"
      title="Einstellungen"
      type="button"
      onclick={() => ui.openSettings()}
    >
      <Icon name="settings" size={14} />
    </button>
  </div>
</header>

<style>
  .header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 0 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    font-size: 15px;
  }
  .logo-mark {
    display: inline-grid;
    place-items: center;
    color: #b8a864;
    line-height: 1;
  }
  .logo-name {
    color: var(--text);
    display: inline-flex;
    font-variant-numeric: tabular-nums;
  }
  .logo-name span {
    display: inline-block;
  }
  .header-center {
    display: flex;
    justify-content: center;
  }
  .crumbs {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 360px;
  }
  .crumbs b {
    color: var(--text);
    font-weight: 500;
  }
  .crumbs .secondary {
    color: var(--text);
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .btn {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 6px 12px;
    font-size: 12px;
    border-radius: var(--radius-btn);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-dim);
  }
  .btn-ghost:hover {
    color: var(--text);
    background: var(--surface-2);
  }
  .sep {
    width: 1px;
    height: 20px;
    background: var(--border);
    margin: 0 4px;
  }
</style>
