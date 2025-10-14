class PickerStore {
  active = $state<boolean>(false);
  deleteMode = $state<boolean>(false);
  lastDuplicate = $state<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  setActive(b: boolean): void {
    this.active = b;
    if (!b) {
      this.deleteMode = false;
      this.lastDuplicate = null;
    }
  }

  toggleDelete(): void {
    this.deleteMode = !this.deleteMode;
  }

  setDeleteMode(b: boolean): void {
    this.deleteMode = b;
  }

  flashDuplicate(hex: string): void {
    this.lastDuplicate = hex;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.lastDuplicate === hex) this.lastDuplicate = null;
    }, 1500);
  }
}

export const picker = new PickerStore();
