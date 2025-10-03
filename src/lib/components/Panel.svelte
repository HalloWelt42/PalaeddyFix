<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import ToolAnalysis from "./tools/ToolAnalysis.svelte";
  import ToolExport from "./tools/ToolExport.svelte";
  import ToolPaletteMatch from "./tools/ToolPaletteMatch.svelte";
  import ToolStub from "./tools/ToolStub.svelte";
  import { ui } from "../stores/ui.svelte";

  const titles = {
    analysis: "Farbanalyse",
    palette: "Paletten-Matcher",
    snap: "Snap-to-Palette",
    export: "Export",
  } as const;
</script>

<aside class="panel">
  <div class="head">
    <div class="title">{titles[ui.activeTool]}</div>
    <div class="head-actions">
      <button class="btn-icon" title="Schließen" type="button" onclick={() => ui.togglePanel()}>
        <Icon name="x" size={14} />
      </button>
    </div>
  </div>
  <div class="body">
    {#if ui.activeTool === "analysis"}
      <ToolAnalysis />
    {:else if ui.activeTool === "palette"}
      <ToolPaletteMatch />
    {:else if ui.activeTool === "snap"}
      <ToolStub
        title="Snap-to-Palette"
        plannedIn="v0.3"
        description="Wandelt das Bild in eine Kopie um, die nur Farben der gewählten Palette verwendet. Mit optionalem Dithering."
      />
    {:else if ui.activeTool === "export"}
      <ToolExport />
    {/if}
  </div>
</aside>

<style>
  .panel {
    background: var(--surface);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }
  .head {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    color: var(--text);
  }
  .head-actions {
    display: flex;
    gap: 4px;
  }
  .btn-icon {
    width: 30px;
    height: 30px;
    padding: 0;
    display: grid;
    place-items: center;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-dim);
    cursor: pointer;
    border-radius: var(--radius-btn);
  }
  .btn-icon:hover {
    color: var(--text);
    background: var(--surface-2);
  }
  .body {
    flex: 1;
    overflow: auto;
    padding: 14px;
  }
</style>
