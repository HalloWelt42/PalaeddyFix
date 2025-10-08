<script lang="ts">
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import RailLeft from "./RailLeft.svelte";
  import RailRight from "./RailRight.svelte";
  import Main from "./Main.svelte";
  import Panel from "./Panel.svelte";
  import SettingsModal from "./SettingsModal.svelte";
  import InfoPanel from "./InfoPanel.svelte";
  import DonationOverlay from "./DonationOverlay.svelte";
  import { gallery } from "../stores/gallery.svelte";
  import { settings } from "../stores/settings.svelte";
  import { info } from "../stores/info.svelte";
  import { ui } from "../stores/ui.svelte";
  import { installClipboardListener } from "../import/clipboard";
  import { ingestFiles } from "../import/fileIntake";
  import { selection } from "../stores/selection.svelte";

  let globalFileInput = $state<HTMLInputElement | null>(null);
  let donationOpen = $state<boolean>(false);

  function openPicker(): void {
    globalFileInput?.click();
  }

  async function onGlobalInputChange(e: Event): Promise<void> {
    const input = e.currentTarget as HTMLInputElement;
    if (input.files) {
      const images = await ingestFiles(Array.from(input.files));
      if (images.length > 0) {
        await gallery.addMany(images);
        await selection.select(images[0].id);
      }
      input.value = "";
    }
  }

  function onKey(e: KeyboardEvent): void {
    const tgt = e.target as HTMLElement | null;
    const inField =
      tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA" || tgt.isContentEditable);

    const meta = e.metaKey || e.ctrlKey;

    if (meta && (e.key === "o" || e.key === "O")) {
      e.preventDefault();
      openPicker();
      return;
    }

    if (e.key === "Escape" && !inField) {
      if (ui.settingsOpen) {
        ui.closeSettings();
        return;
      }
      if (info.open) {
        info.close();
        return;
      }
      if (selection.id) {
        void selection.select(null);
      }
    }
  }

  onMount(() => {
    settings.init();
    info.init();
    void gallery.init();

    const removeClipboard = installClipboardListener(async (files) => {
      const images = await ingestFiles(files);
      if (images.length > 0) {
        await gallery.addMany(images);
        await selection.select(images[0].id);
      }
    });

    return () => {
      removeClipboard();
    };
  });
</script>

<svelte:window onkeydown={onKey} />

<div class="app">
  <Header onOpenPicker={openPicker} onOpenDonation={() => (donationOpen = true)} />
  <div class="content" class:panel-closed={!ui.panelOpen}>
    <RailLeft />
    <Main />
    {#if ui.panelOpen}
      <Panel />
    {/if}
    <RailRight />
  </div>
  <Footer />
  <SettingsModal />
  <InfoPanel />
  <DonationOverlay open={donationOpen} onClose={() => (donationOpen = false)} />

  <input
    bind:this={globalFileInput}
    type="file"
    accept="image/*"
    multiple
    style="display: none;"
    onchange={onGlobalInputChange}
  />
</div>

<style>
  .app {
    height: 100vh;
    background: var(--bg);
    display: grid;
    grid-template-rows: var(--h-header) 1fr var(--h-footer);
    overflow: hidden;
  }
  .content {
    display: grid;
    grid-template-columns:
      var(--w-rail)
      calc((100% - 2 * var(--w-rail)) * 0.618)
      calc((100% - 2 * var(--w-rail)) * 0.382)
      var(--w-rail);
    min-height: 0;
  }
  .content.panel-closed {
    grid-template-columns:
      var(--w-rail)
      1fr
      var(--w-rail);
  }
</style>
