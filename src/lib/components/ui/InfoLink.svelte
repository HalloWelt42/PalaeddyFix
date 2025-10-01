<script lang="ts">
  import { info } from "../../stores/info.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    topic: string;
    children: Snippet;
  };

  const { topic, children }: Props = $props();

  function open(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    info.show(topic);
  }
</script>

<button type="button" class="info-link" onclick={open} title="Mehr erfahren">
  {@render children()}
  <span class="mark" aria-hidden="true">?</span>
</button>

<style>
  .info-link {
    background: transparent;
    border: 0;
    padding: 0;
    color: inherit;
    font: inherit;
    cursor: help;
    display: inline-flex;
    align-items: baseline;
    gap: 3px;
    text-decoration: underline dotted var(--text-mute);
    text-underline-offset: 3px;
  }
  .info-link:hover {
    color: var(--text);
    text-decoration-color: var(--text);
  }
  .mark {
    display: inline-grid;
    place-items: center;
    width: 12px;
    height: 12px;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    color: var(--text-mute);
    border: 1px solid currentColor;
    border-radius: 50%;
    line-height: 1;
    transform: translateY(-1px);
  }
  .info-link:hover .mark {
    color: var(--text);
  }
</style>
