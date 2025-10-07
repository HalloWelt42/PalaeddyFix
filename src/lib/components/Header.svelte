<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { ui } from "../stores/ui.svelte";

  type Props = {
    onOpenPicker?: () => void;
  };

  const { onOpenPicker }: Props = $props();

  const brand = "PaläddyFix";
  const brandChars: string[] = Array.from(brand);

  const brandColors: string[] = [
    "oklch(0.62 0.26 29)",   // P -- Knallrot
    "oklch(0.78 0.2 65)",    // a -- heller Orange
    "oklch(0.88 0.2 100)",   // l -- Gelb
    "oklch(0.62 0.26 137)",  // ä -- Grün
    "oklch(0.62 0.26 191)",  // d -- Türkis, gemittelt zwischen ä und d2
    "oklch(0.62 0.26 245)",  // d -- Blau
    "oklch(0.42 0.22 265)",  // y -- Dunkelblau
    "oklch(0.62 0.26 295)",  // F -- Violett
    "oklch(0.62 0.26 325)",  // i -- Magenta
    "oklch(0.62 0.26 353)",  // x -- Pink
  ];
</script>

<header class="header">
  <div class="logo">
    <span class="logo-mark">
      <Icon name="palette" size={27} />
    </span>
    <div class="logo-name" aria-label={brand}>
      {#each brandChars as ch, i (i)}
        <span style="color: {brandColors[i] ?? 'var(--text)'};">{ch}</span>
      {/each}
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
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    font-size: 30px;
    line-height: 1;
    letter-spacing: 0;
  }
  .logo-name span {
    display: inline-block;
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
