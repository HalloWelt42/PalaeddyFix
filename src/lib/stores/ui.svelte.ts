export type ToolKey = "analysis" | "palette" | "snap" | "contrast" | "export";
export type LeftTab = "gallery" | "palettes" | "contrast";

class UIStore {
  activeTool = $state<ToolKey>("analysis");
  activeLeft = $state<LeftTab | null>("gallery");
  panelOpen = $state<boolean>(true);
  settingsOpen = $state<boolean>(false);
  contrastMatrixFull = $state<boolean>(false);

  setTool(tool: ToolKey): void {
    this.activeTool = tool;
    this.panelOpen = true;
    if (tool === "contrast") {
      this.activeLeft = "contrast";
    } else if (this.activeLeft === "contrast") {
      this.activeLeft = null;
    }
  }

  setLeft(tab: LeftTab | null): void {
    this.activeLeft = tab;
    if (tab === "contrast") {
      this.activeTool = "contrast";
      this.panelOpen = true;
    } else if (this.activeTool === "contrast") {
      this.panelOpen = false;
    }
  }

  toggleLeft(tab: LeftTab): void {
    this.setLeft(this.activeLeft === tab ? null : tab);
  }

  closeTool(): void {
    this.panelOpen = false;
    if (this.activeTool === "contrast") this.activeLeft = null;
  }

  togglePanel(): void {
    if (this.panelOpen) this.closeTool();
    else this.panelOpen = true;
  }

  openSettings(): void {
    this.settingsOpen = true;
  }

  closeSettings(): void {
    this.settingsOpen = false;
  }
}

export const ui = new UIStore();
