import { getImage } from "../storage/db";
import type { StoredImage } from "../storage/schema";

export type ImageRegion = { x: number; y: number; w: number; h: number };

class SelectionStore {
  id = $state<string | null>(null);
  fullBlobUrl = $state<string | null>(null);
  region = $state<ImageRegion | null>(null);
  rectTool = $state<boolean>(false);

  private currentUrl: string | null = null;

  async select(id: string | null): Promise<void> {
    if (this.id === id) return;
    this.id = id;
    this.region = null;
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl);
      this.currentUrl = null;
    }
    if (!id) {
      this.fullBlobUrl = null;
      return;
    }
    const img: StoredImage | undefined = await getImage(id);
    if (!img) {
      this.fullBlobUrl = null;
      return;
    }
    this.currentUrl = URL.createObjectURL(img.blob);
    this.fullBlobUrl = this.currentUrl;
  }

  setRegion(region: ImageRegion | null): void {
    this.region = region;
  }

  clearRegion(): void {
    this.region = null;
  }

  toggleRectTool(): void {
    this.rectTool = !this.rectTool;
    if (!this.rectTool) this.region = null;
  }

  clear(): void {
    void this.select(null);
  }
}

export const selection = new SelectionStore();
