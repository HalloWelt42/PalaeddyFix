import {
  DEFAULT_SETTINGS,
  type CopyFormat,
  type Settings,
  type ThemeMode,
} from "../storage/schema";
import { loadSettings, saveSettings } from "../storage/settings";

class SettingsStore {
  state = $state<Settings>({ ...DEFAULT_SETTINGS });
  loaded = $state<boolean>(false);

  init(): void {
    this.state = loadSettings();
    this.applyTheme(this.state.theme);
    this.loaded = true;
  }

  update(patch: Partial<Settings>): void {
    this.state = { ...this.state, ...patch };
    saveSettings(this.state);
    if (patch.theme) this.applyTheme(patch.theme);
  }

  setTheme(theme: ThemeMode): void {
    this.update({ theme });
  }

  setCopyFormat(copyFormat: CopyFormat): void {
    this.update({ copyFormat });
  }

  private applyTheme(theme: ThemeMode): void {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
  }
}

export const settings = new SettingsStore();
