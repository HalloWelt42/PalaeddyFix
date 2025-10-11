<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import CodeBlock from "../ui/CodeBlock.svelte";
  import { analysis } from "../../stores/analysis.svelte";
  import { palettes } from "../../stores/palettes.svelte";
  import { rgbToHex } from "../../analysis/convert";
  import {
    downloadOutput,
    runExport,
    EXPORT_DESCRIPTORS,
    type ExportFormat,
  } from "../../export/formats";
  import type { PaletteColor } from "../../storage/schema";

  type SourceKey = "frequent" | "rare" | "working" | string;

  let format = $state<ExportFormat>("css");
  let source = $state<SourceKey>("frequent");
  let flash = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  const sourceOptions = $derived.by(() => {
    const opts: { value: SourceKey; label: string; count: number }[] = [];
    if (analysis.colors.length > 0) {
      opts.push({ value: "frequent", label: "Analyse · Häufigste", count: analysis.colors.length });
    }
    if (analysis.rareColors.length > 0) {
      opts.push({ value: "rare", label: "Analyse · Seltenste", count: analysis.rareColors.length });
    }
    if (palettes.working.length > 0) {
      opts.push({ value: "working", label: "Arbeitspalette", count: palettes.working.length });
    }
    for (const p of palettes.items) {
      opts.push({ value: `own-${p.id}`, label: `Eigene · ${p.name}`, count: p.colors.length });
    }
    return opts;
  });

  const sourceColors = $derived.by<PaletteColor[]>(() => {
    if (source === "frequent") return analysis.colors;
    if (source === "rare") return analysis.rareColors;
    if (source === "working") {
      return palettes.working.map((rgb) => ({
        rgb,
        hex: rgbToHex(rgb),
        count: 1,
        percent: 100 / Math.max(1, palettes.working.length),
      }));
    }
    if (source.startsWith("own-")) {
      const id = source.slice(4);
      const pal = palettes.items.find((p) => p.id === id);
      if (!pal) return [];
      return pal.colors.map((rgb) => ({
        rgb,
        hex: rgbToHex(rgb),
        count: 1,
        percent: 100 / Math.max(1, pal.colors.length),
      }));
    }
    return [];
  });

  $effect(() => {
    if (sourceOptions.length === 0) return;
    if (!sourceOptions.some((o) => o.value === source)) {
      source = sourceOptions[0].value;
    }
  });

  const output = $derived(
    sourceColors.length > 0 ? runExport(format, sourceColors) : null,
  );

  const grouped = $derived.by(() => {
    const map = new Map<string, typeof EXPORT_DESCRIPTORS>();
    for (const d of EXPORT_DESCRIPTORS) {
      const list = map.get(d.categoryLabel) ?? [];
      list.push(d);
      map.set(d.categoryLabel, list);
    }
    return Array.from(map.entries());
  });

  const activeDescriptor = $derived(
    EXPORT_DESCRIPTORS.find((d) => d.id === format),
  );

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

{#if sourceOptions.length === 0}
  <div class="empty">
    <Icon name="download" size={32} />
    <p>Noch nichts zu exportieren.</p>
    <p class="sub">Führe erst eine Analyse durch oder öffne eine eigene Palette.</p>
  </div>
{:else}
  <div class="control">
    <label class="k" for="src">Quelle</label>
    <select id="src" bind:value={source}>
      {#each sourceOptions as opt (opt.value)}
        <option value={opt.value}>{opt.label} · {opt.count}</option>
      {/each}
    </select>
  </div>
  <div class="control">
    <label class="k" for="fmt">Format</label>
    <select id="fmt" bind:value={format}>
      {#each grouped as [cat, items] (cat)}
        <optgroup label={cat}>
          {#each items as d (d.id)}
            <option value={d.id}>{d.label}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
  </div>

  {#if output}
    <div class="section">
      <div class="between">
        <span class="file">{output.filename}</span>
        {#if activeDescriptor}
          <span class="cat">{activeDescriptor.categoryLabel}</span>
        {/if}
      </div>
      <CodeBlock code={output.content} lang={output.lang} filename={output.filename} />
    </div>

    <div class="actions">
      <button type="button" class="btn" onclick={copyAll}>
        <Icon name="copy" size={12} /> Kopieren
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

  .control {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
  }
  .k {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
  }
  select {
    background: var(--bg);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 6px 8px;
    font-family: var(--font-sans);
    font-size: 12px;
    border-radius: 3px;
    outline: none;
    width: 100%;
  }
  select:focus {
    border-color: var(--accent-line);
  }

  .section {
    margin-bottom: 12px;
  }
  .between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .file {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text);
    letter-spacing: 0.5px;
  }
  .cat {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 1px 6px;
    border: 1px solid var(--border-strong);
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
