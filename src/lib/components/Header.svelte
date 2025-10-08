<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { settings } from "../stores/settings.svelte";
  import type { ThemeMode } from "../storage/schema";

  type Props = {
    onOpenPicker?: () => void;
    onOpenDonation?: () => void;
  };

  const { onOpenPicker, onOpenDonation }: Props = $props();

  const brand = "PaläddyFix";
  const brandChars: string[] = Array.from(brand);

  const brandColors: string[] = [
    "oklch(0.62 0.26 29)",
    "oklch(0.78 0.2 65)",
    "oklch(0.88 0.2 100)",
    "oklch(0.62 0.26 137)",
    "oklch(0.62 0.26 191)",
    "oklch(0.62 0.26 245)",
    "oklch(0.42 0.22 265)",
    "oklch(0.62 0.26 295)",
    "oklch(0.62 0.26 325)",
    "oklch(0.62 0.26 353)",
  ];

  const themes: { value: ThemeMode; title: string; icon: "sun" | "moon" | "desktop" }[] = [
    { value: "light", title: "Heller Modus", icon: "sun" },
    { value: "dark", title: "Dunkler Modus", icon: "moon" },
    { value: "system", title: "Systemeinstellung", icon: "desktop" },
  ];
</script>

<header class="header">
  <div class="logo">
    <span class="logo-mark">
      <Icon name="palette" size={27} />
    </span>
    <div class="logo-name" aria-label={brand}>
      {#each brandChars as ch, i (i)}
        <span style="color: {brandColors[i] ?? 'var(--text)'};">{ch}</span>
      {/each}
    </div>
    <button
      type="button"
      class="love-btn"
      title="Danke sagen"
      onclick={() => onOpenDonation?.()}
    >
      <i class="fa-solid fa-heart" aria-hidden="true"></i>
    </button>
  </div>

  <div class="header-right">
    <button
      class="btn btn-ghost"
      title="Neues Bild öffnen"
      type="button"
      onclick={() => onOpenPicker?.()}
    >
      <Icon name="plus" size={14} /> Neu
    </button>
    <span class="sep"></span>
    <div class="theme-group" role="group" aria-label="Theme">
      {#each themes as t (t.value)}
        <button
          type="button"
          class="theme-btn"
          class:active={settings.state.theme === t.value}
          title={t.title}
          onclick={() => settings.setTheme(t.value)}
        >
          <Icon name={t.icon} size={14} />
        </button>
      {/each}
    </div>
    <span class="sep"></span>
    <a
      class="gh-link"
      href="https://github.com/HalloWelt42/PalaeddyFix"
      target="_blank"
      rel="noopener noreferrer"
      title="Quellcode auf GitHub"
    >
      <i class="fa-brands fa-github" aria-hidden="true"></i>
    </a>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    font-size: 15px;
  }
  .logo-mark {
    display: inline-grid;
    place-items: center;
    color: #b8a864;
    line-height: 1;
  }
  .logo-name {
    color: var(--text);
    display: inline-flex;
    font-variant-numeric: tabular-nums;
    font-size: 30px;
    line-height: 1;
    letter-spacing: 0;
  }
  .logo-name span {
    display: inline-block;
  }

  .love-btn {
    margin-left: 8px;
    background: transparent;
    border: 0;
    padding: 4px 6px;
    cursor: pointer;
    color: #ef4444;
    line-height: 1;
    border-radius: 4px;
    transition: filter 0.15s, background 0.15s;
  }
  .love-btn :global(i) {
    font-size: 16px;
    filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.45));
    animation: heartbeat 1.6s ease-in-out infinite;
  }
  .love-btn:hover {
    background: rgba(239, 68, 68, 0.08);
  }
  .love-btn:hover :global(i) {
    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.75));
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .btn {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 6px 12px;
    font-size: 12px;
    border-radius: var(--radius-btn);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-dim);
  }
  .btn-ghost:hover {
    color: var(--text);
    background: var(--surface-2);
  }
  .sep {
    width: 1px;
    height: 20px;
    background: var(--border);
    margin: 0 4px;
  }

  .theme-group {
    display: inline-flex;
    border: 1px solid var(--border-strong);
    border-radius: 3px;
    overflow: hidden;
    background: var(--surface-2);
  }
  .theme-btn {
    background: transparent;
    border: 0;
    padding: 5px 9px;
    color: var(--text-dim);
    cursor: pointer;
    display: grid;
    place-items: center;
  }
  .theme-btn + .theme-btn {
    border-left: 1px solid var(--border-strong);
  }
  .theme-btn:hover {
    color: var(--text);
  }
  .theme-btn.active {
    background: var(--text);
    color: var(--bg);
  }

  .gh-link {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    color: var(--text-dim);
    text-decoration: none;
    border-radius: 3px;
  }
  .gh-link :global(i) {
    font-size: 16px;
  }
  .gh-link:hover {
    color: var(--text);
    background: var(--surface-2);
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    15% { transform: scale(1.2); }
    30% { transform: scale(1); }
    45% { transform: scale(1.1); }
    60% { transform: scale(1); }
  }
</style>
