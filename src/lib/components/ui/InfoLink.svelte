<script lang="ts">
  import { info } from "../../stores/info.svelte";
  import Icon from "./Icon.svelte";
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
  <span class="mark" aria-hidden="true">
    <Icon name="info" size={12} />
  </span>
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
    gap: 4px;
    text-decoration: underline dotted var(--info-line);
    text-underline-offset: 3px;
  }
  .info-link:hover {
    color: var(--info);
    text-decoration-color: var(--info);
  }
  .mark {
    display: inline-grid;
    place-items: center;
    color: var(--info);
    line-height: 1;
    transform: translateY(1px);
  }
  .info-link:hover .mark {
    color: var(--info);
  }
</style>
