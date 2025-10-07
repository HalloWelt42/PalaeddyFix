<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import type { IconName } from "./ui/Icon.svelte";
  import { ui } from "../stores/ui.svelte";
  import type { ToolKey } from "../stores/ui.svelte";
  import { info } from "../stores/info.svelte";

  type RailItem = {
    key: ToolKey;
    name: IconName;
    title: string;
  };

  const top: RailItem[] = [
    { key: "analysis", name: "droplet", title: "Farbanalyse" },
    { key: "palette", name: "palette", title: "Paletten-Matcher" },
    { key: "snap", name: "magic", title: "Snap-to-Palette" },
    { key: "contrast", name: "contrast", title: "WCAG-Kontrast" },
    { key: "export", name: "download", title: "Export" },
  ];
</script>

<aside class="rail right">
  <div class="group">
    {#each top as item (item.key)}
      <button
        class="rail-btn"
        class:active={ui.activeTool === item.key}
        title={item.title}
        type="button"
        onclick={() => ui.setTool(item.key)}
      >
        <Icon name={item.name} size={18} />
      </button>
    {/each}
  </div>
  <div class="group">
    <button
      class="rail-btn info-btn"
      class:active={info.open}
      title={info.open ? "Info schließen" : "Info öffnen"}
      type="button"
      onclick={() => (info.open ? info.close() : info.show(info.topicKey ?? "median-cut"))}
    >
      <Icon name="info" size={18} />
    </button>
  </div>
</aside>

<style>
  .rail {
    background: var(--surface);
    border-left: 1px solid var(--border);
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
    right: 0;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: var(--accent);
  }
  .info-btn {
    color: var(--info);
  }
  .info-btn:hover {
    color: var(--info);
    background: var(--info-soft);
  }
  .info-btn.active {
    color: var(--info);
    background: var(--info-soft);
  }
  .info-btn.active::after {
    background: var(--info);
  }
</style>
