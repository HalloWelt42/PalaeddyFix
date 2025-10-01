export type ToolKey = "analysis" | "palette" | "snap" | "export";
export type LeftTab = "gallery" | "import" | "favorites" | "tags" | "folders" | "trash" | "settings";

class UIStore {
  activeTool = $state<ToolKey>("analysis");
  activeLeft = $state<LeftTab>("gallery");
  panelOpen = $state<boolean>(true);
  settingsOpen = $state<boolean>(false);

  setTool(tool: ToolKey): void {
    this.activeTool = tool;
    this.panelOpen = true;
  }

  setLeft(tab: LeftTab): void {
    this.activeLeft = tab;
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
