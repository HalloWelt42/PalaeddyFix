<script lang="ts">
  import type { PaletteColor } from "../../storage/schema";

  type Props = {
    colors: PaletteColor[];
    onHover?: (color: PaletteColor | null) => void;
  };

  const { colors, onHover }: Props = $props();
</script>

<div class="bar" role="img" aria-label="Farbverteilung">
  {#each colors as c, i (i)}
    <div
      class="seg"
      style="background: {c.hex}; width: {c.percent}%;"
      title={`${c.hex} · ${c.percent.toFixed(1)}%`}
      onmouseenter={() => onHover?.(c)}
      onmouseleave={() => onHover?.(null)}
      role="presentation"
    ></div>
  {/each}
</div>

<style>
  .bar {
    display: flex;
    width: 100%;
    height: 22px;
    border: 1px solid var(--border-strong);
    overflow: hidden;
    background: var(--surface-2);
  }
  .seg {
    height: 100%;
    min-width: 1px;
    transition: filter 0.1s;
  }
  .seg:hover {
    filter: brightness(1.15);
  }
</style>
