import {
  deleteImage,
  listImages,
  putImage,
  setPinned,
  storageUsage,
} from "../storage/db";
import type { ImageListItem, StoredImage } from "../storage/schema";

class GalleryStore {
  items = $state<ImageListItem[]>([]);
  loaded = $state<boolean>(false);
  usage = $state<{ used: number; quota: number }>({ used: 0, quota: 0 });

  private urls = new Map<string, string>();

  async init(): Promise<void> {
    if (this.loaded) return;
    const images = await listImages();
    this.items = images.map((img) => this.toListItem(img));
    this.loaded = true;
    await this.refreshUsage();
  }

  async add(img: StoredImage): Promise<void> {
    await putImage(img);
    this.items = [this.toListItem(img), ...this.items];
    await this.refreshUsage();
  }

  async addMany(images: StoredImage[]): Promise<void> {
    for (const img of images) {
      await putImage(img);
    }
    const newItems = images.map((img) => this.toListItem(img));
    this.items = [...newItems, ...this.items];
    await this.refreshUsage();
  }

  async remove(id: string): Promise<void> {
    this.releaseUrl(id);
    await deleteImage(id);
    this.items = this.items.filter((i) => i.id !== id);
    await this.refreshUsage();
  }

  async togglePin(id: string): Promise<void> {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    const next = !item.pinned;
    await setPinned(id, next);
    this.items = this.items.map((i) => (i.id === id ? { ...i, pinned: next } : i));
  }

  private toListItem(img: StoredImage): ImageListItem {
    const source = img.thumbBlob ?? img.blob;
    const url = URL.createObjectURL(source);
    this.urls.set(img.id, url);
    const { blob: _blob, thumbBlob: _thumb, ...rest } = img;
    return { ...rest, thumbUrl: url };
  }

  private releaseUrl(id: string): void {
    const url = this.urls.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      this.urls.delete(id);
    }
  }

  async refreshUsage(): Promise<void> {
    this.usage = await storageUsage();
  }
}

export const gallery = new GalleryStore();
