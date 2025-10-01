import { getImage } from "../storage/db";
import type { StoredImage } from "../storage/schema";

class SelectionStore {
  id = $state<string | null>(null);
  fullBlobUrl = $state<string | null>(null);

  private currentUrl: string | null = null;

  async select(id: string | null): Promise<void> {
    if (this.id === id) return;
    this.id = id;
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

  clear(): void {
    void this.select(null);
  }
}

export const selection = new SelectionStore();
