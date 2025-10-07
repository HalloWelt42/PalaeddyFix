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
    if (tool !== "contrast") this.contrastMatrixFull = false;
  }

  toggleContrastMatrixFull(): void {
    this.contrastMatrixFull = !this.contrastMatrixFull;
  }

  setLeft(tab: LeftTab | null): void {
    this.activeLeft = tab;
  }

  toggleLeft(tab: LeftTab): void {
    this.activeLeft = this.activeLeft === tab ? null : tab;
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  openSettings(): void {
    this.settingsOpen = true;
  }

  closeSettings(): void {
    this.settingsOpen = false;
  }
}

export const ui = new UIStore();
