<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import Segmented from "./ui/Segmented.svelte";
  import InfoLink from "./ui/InfoLink.svelte";
  import { ui } from "../stores/ui.svelte";
  import { settings } from "../stores/settings.svelte";
  import { gallery } from "../stores/gallery.svelte";
  import { clearAll } from "../storage/db";
  import { selection } from "../stores/selection.svelte";
  import type { ThemeMode, AlphaMode } from "../storage/schema";

  let confirmClear = $state<boolean>(false);

  function close(): void {
    ui.closeSettings();
  }

  function onBackdrop(e: MouseEvent): void {
    if (e.target === e.currentTarget) close();
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === "Escape") close();
  }

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "dark", label: "Dunkel" },
    { value: "light", label: "Hell" },
    { value: "system", label: "System" },
  ];

  const alphaOptions: { value: AlphaMode; label: string }[] = [
    { value: "ignore", label: "Ignorieren" },
    { value: "factor", label: "Als Faktor" },
    { value: "keep", label: "Mitführen" },
  ];

  async function handleClear(): Promise<void> {
    if (!confirmClear) {
      confirmClear = true;
      setTimeout(() => (confirmClear = false), 3000);
      return;
    }
    await selection.select(null);
    await clearAll();
    gallery.items = [];
    await gallery.refreshUsage();
    confirmClear = false;
  }

  function formatMB(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const usagePercent = $derived(() => {
    const { used, quota } = gallery.usage;
    if (quota === 0) return 0;
    return Math.min(100, (used / quota) * 100);
  });
</script>

<svelte:window onkeydown={onKey} />

{#if ui.settingsOpen}
  <div class="backdrop" onclick={onBackdrop} role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="head">
        <h2 id="settings-title">Einstellungen</h2>
        <button type="button" class="close" onclick={close} title="Schließen">
          <Icon name="x" size={16} />
        </button>
      </div>
      <div class="body">
        <section>
          <h3>Darstellung</h3>
          <div class="row">
            <div class="label">
              <div class="name">Theme</div>
              <div class="hint">Helligkeit der Oberfläche</div>
            </div>
            <Segmented
              options={themeOptions}
              value={settings.state.theme}
              onchange={(v) => settings.setTheme(v)}
            />
          </div>
        </section>

        <section>
          <h3>Analyse</h3>
          <div class="row">
            <div class="label">
              <div class="name">Transparenz</div>
              <div class="hint">
                Wie werden <InfoLink topic="alpha">Alpha-Werte</InfoLink> im
                Bild behandelt?
              </div>
            </div>
            <Segmented
              options={alphaOptions}
              value={settings.state.alpha}
              onchange={(v) => settings.update({ alpha: v })}
            />
          </div>
          <div class="row">
            <div class="label">
              <div class="name">
                <InfoLink topic="downscale">Downscale</InfoLink>-Grenze
              </div>
              <div class="hint">Max. Kantenlänge vor der Analyse (Pixel)</div>
            </div>
            <input
              type="number"
              min="256"
              max="4096"
              step="64"
              value={settings.state.downscaleTo}
              oninput={(e) =>
                settings.update({
                  downscaleTo: Number((e.currentTarget as HTMLInputElement).value),
                })}
            />
          </div>
          <div class="row">
            <div class="label">
              <div class="name">Standard-Farbanzahl</div>
              <div class="hint">Voreinstellung beim Öffnen eines Bildes</div>
            </div>
            <input
              type="number"
              min="2"
              max="256"
              step="1"
              value={settings.state.defaultColorCount}
              oninput={(e) =>
                settings.update({
                  defaultColorCount: Number((e.currentTarget as HTMLInputElement).value),
                })}
            />
          </div>
        </section>

        <section>
          <h3>Speicher</h3>
          <div class="usage">
            <div class="usage-head">
              <span>{formatMB(gallery.usage.used)} verwendet</span>
              <span class="mute">von {formatMB(gallery.usage.quota)}</span>
            </div>
            <div class="usage-bar">
              <div class="usage-fill" style="width: {usagePercent()}%;"></div>
            </div>
          </div>
          <div class="row">
            <div class="label">
              <div class="name">Alle Bilder löschen</div>
              <div class="hint">
                Löscht Bilder und gecachte Analysen aus der
                <InfoLink topic="indexeddb">IndexedDB</InfoLink>
              </div>
            </div>
            <button
              type="button"
              class="btn danger"
              onclick={handleClear}
            >
              {#if confirmClear}Wirklich löschen?{:else}Alle löschen{/if}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    z-index: 100;
    backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    width: 620px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 80px);
    display: grid;
    grid-template-rows: auto 1fr;
    box-shadow: 0 24px 64px #000a;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
  }
  .head h2 {
    font-family: var(--font-button);
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }
  .close {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-dim);
    cursor: pointer;
    border-radius: var(--radius-btn);
  }
  .close:hover {
    color: var(--text);
    background: var(--surface-2);
  }
  .body {
    padding: 18px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  section h3 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-mute);
    font-weight: 600;
    padding-bottom: 6px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }
  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 18px;
    align-items: center;
    padding: 8px 0;
    border-top: 1px solid var(--border);
  }
  .row:first-of-type {
    border-top: 0;
  }
  .label .name {
    font-size: 13px;
    color: var(--text);
    margin-bottom: 2px;
  }
  .label .hint {
    font-family: var(--font-button);
    font-size: 12px;
    color: var(--text-dim);
  }
  input[type="number"] {
    background: var(--bg);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 6px 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    border-radius: 3px;
    width: 96px;
    text-align: right;
    outline: none;
  }
  input[type="number"]:focus {
    border-color: var(--accent-line);
  }
  .usage {
    padding: 8px 0;
  }
  .usage-head {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    margin-bottom: 6px;
  }
  .usage-head .mute {
    color: var(--text-dim);
  }
  .usage-bar {
    height: 6px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .usage-fill {
    height: 100%;
    background: var(--text);
  }
  .btn {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 8px 14px;
    font-size: 12px;
    border-radius: var(--radius-btn);
    cursor: pointer;
  }
  .btn.danger {
    color: var(--err);
    border-color: var(--err);
  }
  .btn.danger:hover {
    background: var(--err);
    color: #fff;
  }
</style>
