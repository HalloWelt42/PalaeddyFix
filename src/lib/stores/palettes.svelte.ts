import {
  deletePalette,
  listPalettes,
  putPalette,
  setPalettePinned,
} from "../storage/db";
import type { PaletteColor, PaletteSource, StoredPalette } from "../storage/schema";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const ACTIVE_BUILTIN_KEY = "palettes-active-builtin";

class PalettesStore {
  items = $state<StoredPalette[]>([]);
  loaded = $state<boolean>(false);

  working = $state<Array<[number, number, number]>>([]);

  activeBuiltin = $state<Set<string>>(this.loadActiveBuiltin());

  private loadActiveBuiltin(): Set<string> {
    try {
      const raw = localStorage.getItem(ACTIVE_BUILTIN_KEY);
      if (!raw) return new Set();
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set();
    }
  }

  private saveActiveBuiltin(): void {
    try {
      localStorage.setItem(ACTIVE_BUILTIN_KEY, JSON.stringify([...this.activeBuiltin]));
    } catch {
      /* ignore */
    }
  }

  toggleBuiltinActive(id: string): void {
    const next = new Set(this.activeBuiltin);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.activeBuiltin = next;
    this.saveActiveBuiltin();
  }

  isBuiltinActive(id: string): boolean {
    return this.activeBuiltin.has(id);
  }

  countActive(): number {
    return this.activeBuiltin.size + this.items.filter((p) => p.pinned).length;
  }

  async init(): Promise<void> {
    this.items = await listPalettes();
    this.loaded = true;
  }

  async create(input: {
    name: string;
    source: PaletteSource;
    sourceImageId?: string;
    colors: Array<[number, number, number]>;
    note?: string;
  }): Promise<StoredPalette> {
    const pal: StoredPalette = {
      id: randomId(),
      name: input.name || "Unbenannt",
      source: input.source,
      sourceImageId: input.sourceImageId,
      colors: input.colors.slice(),
      createdAt: Date.now(),
      pinned: false,
      note: input.note,
    };
    await putPalette(pal);
    this.items = [pal, ...this.items];
    return pal;
  }

  async saveFromColors(
    name: string,
    colors: PaletteColor[],
    source: PaletteSource,
    sourceImageId?: string,
  ): Promise<StoredPalette> {
    return this.create({
      name,
      source,
      sourceImageId,
      colors: colors.map((c) => [c.rgb[0], c.rgb[1], c.rgb[2]]),
    });
  }

  async rename(id: string, name: string): Promise<void> {
    const pal = this.items.find((p) => p.id === id);
    if (!pal) return;
    pal.name = name;
    await putPalette(pal);
    this.items = this.items.map((p) => (p.id === id ? pal : p));
  }

  async setNote(id: string, note: string): Promise<void> {
    const pal = this.items.find((p) => p.id === id);
    if (!pal) return;
    pal.note = note;
    await putPalette(pal);
    this.items = this.items.map((p) => (p.id === id ? pal : p));
  }

  async removeColorAt(id: string, index: number): Promise<void> {
    const pal = this.items.find((p) => p.id === id);
    if (!pal) return;
    if (index < 0 || index >= pal.colors.length) return;
    pal.colors = pal.colors.filter((_, i) => i !== index);
    await putPalette(pal);
    this.items = this.items.map((p) => (p.id === id ? pal : p));
  }

  async remove(id: string): Promise<void> {
    await deletePalette(id);
    this.items = this.items.filter((p) => p.id !== id);
  }

  async togglePin(id: string): Promise<void> {
    const pal = this.items.find((p) => p.id === id);
    if (!pal) return;
    const next = !pal.pinned;
    await setPalettePinned(id, next);
    pal.pinned = next;
    this.items = this.items.map((p) => (p.id === id ? pal : p));
  }

  workingAdd(rgb: [number, number, number]): void {
    if (this.working.some((c) => c[0] === rgb[0] && c[1] === rgb[1] && c[2] === rgb[2])) return;
    this.working = [...this.working, rgb];
  }

  workingRemoveAt(idx: number): void {
    this.working = this.working.filter((_, i) => i !== idx);
  }

  workingMove(from: number, to: number): void {
    if (from === to) return;
    const arr = this.working.slice();
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    this.working = arr;
  }

  workingClear(): void {
    this.working = [];
  }

  async workingSaveAs(name: string): Promise<StoredPalette | null> {
    if (this.working.length === 0) return null;
    const pal = await this.create({
      name,
      source: "manual",
      colors: this.working.slice(),
    });
    await this.togglePin(pal.id);
    return pal;
  }
}

export const palettes = new PalettesStore();
