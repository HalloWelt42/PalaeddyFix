<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import CodeBlock from "../ui/CodeBlock.svelte";
  import Segmented from "../ui/Segmented.svelte";
  import { analysis } from "../../stores/analysis.svelte";
  import {
    downloadOutput,
    runExport,
    type ExportFormat,
  } from "../../export/formats";

  let format = $state<ExportFormat>("css");
  let flash = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  const output = $derived(
    analysis.colors.length > 0 ? runExport(format, analysis.colors) : null,
  );

  const formatOptions: { value: ExportFormat; label: string }[] = [
    { value: "hex", label: "HEX" },
    { value: "css", label: "CSS" },
    { value: "tailwind", label: "Tailwind" },
    { value: "json", label: "JSON" },
  ];

  async function copyAll(): Promise<void> {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output.content);
      showFlash("In Zwischenablage kopiert");
    } catch {
      showFlash("Kopieren fehlgeschlagen");
    }
  }

  function download(): void {
    if (!output) return;
    downloadOutput(output);
    showFlash(`${output.filename} heruntergeladen`);
  }

  function showFlash(msg: string): void {
    flash = msg;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flash = null), 1600);
  }
</script>

{#if analysis.colors.length === 0}
  <div class="empty">
    <Icon name="download" size={32} />
    <p>Noch nichts zu exportieren.</p>
    <p class="sub">Führe erst eine Analyse durch.</p>
  </div>
{:else}
  <div class="section">
    <h3>Format</h3>
    <Segmented options={formatOptions} value={format} onchange={(v) => (format = v)} />
  </div>

  {#if output}
    <div class="section">
      <div class="between">
        <h3 class="no-border">Vorschau</h3>
        <span class="file">{output.filename}</span>
      </div>
      <CodeBlock code={output.content} lang={output.lang} filename={output.filename} />
    </div>

    <div class="actions">
      <button type="button" class="btn" onclick={copyAll}>
        <Icon name="check" size={12} /> Kopieren
      </button>
      <button type="button" class="btn btn-primary" onclick={download}>
        <Icon name="download" size={12} /> Herunterladen
      </button>
    </div>
  {/if}

  {#if flash}
    <div class="flash">
      <Icon name="check" size={12} /> {flash}
    </div>
  {/if}
{/if}

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    color: var(--text-mute);
    padding: 40px 14px;
  }
  .empty p {
    font-size: 13px;
    color: var(--text-dim);
  }
  .empty .sub {
    font-size: 11px;
    max-width: 220px;
    color: var(--text-mute);
  }

  .section {
    margin-bottom: 18px;
  }
  .section h3 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-mute);
    margin-bottom: 8px;
    font-weight: 600;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }
  .section h3.no-border {
    padding-bottom: 0;
    border-bottom: 0;
    margin-bottom: 0;
  }
  .between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }
  .file {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    text-transform: lowercase;
    letter-spacing: 0.5px;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 6px;
  }
  .btn {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 8px 12px;
    font-size: 12px;
    border-radius: var(--radius-btn);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
  }
  .btn-primary {
    background: var(--text);
    color: var(--bg);
    border-color: var(--text);
    font-weight: 600;
  }
  .btn-primary:hover {
    opacity: 0.9;
  }

  .flash {
    position: fixed;
    right: 80px;
    bottom: 50px;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 6px 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 16px #0008;
    z-index: 20;
  }
</style>
