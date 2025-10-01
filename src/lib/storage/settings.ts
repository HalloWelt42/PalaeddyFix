import { DEFAULT_SETTINGS, type Settings } from "./schema";

const KEY = "palaeddyfix:settings";

export function loadSettings(): Settings {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...loadSettings(), ...patch };
  saveSettings(next);
  return next;
}

const INFO_KEY = "palaeddyfix:info-panel";

export type InfoPanelState = {
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  open: boolean;
  topic: string | null;
};

export const DEFAULT_INFO_PANEL: InfoPanelState = {
  x: 120,
  y: 120,
  width: 480,
  height: 420,
  minimized: false,
  maximized: false,
  open: false,
  topic: null,
};

export function loadInfoPanel(): InfoPanelState {
  const raw = localStorage.getItem(INFO_KEY);
  if (!raw) return { ...DEFAULT_INFO_PANEL };
  try {
    const parsed = JSON.parse(raw) as Partial<InfoPanelState>;
    return { ...DEFAULT_INFO_PANEL, ...parsed };
  } catch {
    return { ...DEFAULT_INFO_PANEL };
  }
}

export function saveInfoPanel(state: InfoPanelState): void {
  localStorage.setItem(INFO_KEY, JSON.stringify(state));
}
