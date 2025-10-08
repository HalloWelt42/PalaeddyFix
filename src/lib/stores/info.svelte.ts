import {
  DEFAULT_INFO_PANEL,
  loadInfoPanel,
  saveInfoPanel,
  type InfoPanelState,
} from "../storage/settings";

class InfoStore {
  open = $state<boolean>(false);
  topicKey = $state<string | null>(null);
  query = $state<string>("");
  matchIndex = $state<number>(0);
  x = $state<number>(DEFAULT_INFO_PANEL.x);
  y = $state<number>(DEFAULT_INFO_PANEL.y);
  width = $state<number>(DEFAULT_INFO_PANEL.width);
  height = $state<number>(DEFAULT_INFO_PANEL.height);
  minimized = $state<boolean>(false);
  maximized = $state<boolean>(false);

  select(key: string | null): void {
    this.topicKey = key;
    this.matchIndex = 0;
    this.save();
  }

  setQuery(q: string): void {
    this.query = q;
    this.matchIndex = 0;
  }

  nextMatch(total: number): void {
    if (total <= 0) return;
    this.matchIndex = (this.matchIndex + 1) % total;
  }

  prevMatch(total: number): void {
    if (total <= 0) return;
    this.matchIndex = (this.matchIndex - 1 + total) % total;
  }

  init(): void {
    const p = loadInfoPanel();
    this.x = p.x;
    this.y = p.y;
    this.width = p.width;
    this.height = p.height;
    this.minimized = p.minimized;
    this.maximized = p.maximized;
  }

  show(topic: string): void {
    this.topicKey = topic;
    this.open = true;
    this.minimized = false;
    this.save();
  }

  close(): void {
    this.open = false;
    this.save();
  }

  toggleMinimized(): void {
    this.minimized = !this.minimized;
    if (this.minimized) this.maximized = false;
    this.save();
  }

  toggleMaximized(): void {
    this.maximized = !this.maximized;
    if (this.maximized) this.minimized = false;
    this.save();
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setSize(w: number, h: number): void {
    this.width = Math.max(280, w);
    this.height = Math.max(160, h);
  }

  save(): void {
    const state: InfoPanelState = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      minimized: this.minimized,
      maximized: this.maximized,
      open: this.open,
      topic: this.topicKey,
    };
    saveInfoPanel(state);
  }
}

export const info = new InfoStore();
