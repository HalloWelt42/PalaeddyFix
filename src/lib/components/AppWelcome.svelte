<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { ui } from "../stores/ui.svelte";

  type Props = {
    onOpenPicker: () => void;
  };

  const { onOpenPicker }: Props = $props();

  type Feature = {
    icon:
      | "upload"
      | "grid"
      | "palette"
      | "contrast"
      | "droplet"
      | "magic"
      | "download"
      | "info";
    title: string;
    text: string;
  };

  const features: Feature[] = [
    {
      icon: "upload",
      title: "Lokal und privat",
      text: "Drag-and-drop, Zwischenablage oder Datei-Dialog -- alles läuft im Browser, nichts verlässt deinen Rechner.",
    },
    {
      icon: "palette",
      title: "Farben analysieren",
      text: "Automatische Median-Cut-Quantisierung findet die prägenden Farben eines Bildes. Zusätzlich: seltene und kontrastreiche Farben.",
    },
    {
      icon: "contrast",
      title: "Kontrast nach WCAG",
      text: "Vollständige Kontrastmatrix mit AA/AAA-Bewertung für alle Kombinationen einer Palette.",
    },
    {
      icon: "droplet",
      title: "Präziser Farb-Picker",
      text: "Pixelgenaue Auswahl mit Ziellupe direkt aus dem Bild, inklusive Transparenz-Anzeige.",
    },
    {
      icon: "magic",
      title: "Snap und Matching",
      text: "Bilder auf eine Zielpalette reduzieren -- mit oder ohne Dithering (Floyd-Steinberg, Atkinson, Bayer).",
    },
    {
      icon: "download",
      title: "Export in viele Formate",
      text: "CSS, SCSS, Tailwind, Swift, Kotlin, Dart, Python, JSON -- mit CSS-Named-Colors wo sinnvoll.",
    },
  ];
</script>

<div class="welcome">
  <div class="intro">
    <div class="big-logo" aria-hidden="true">
      <Icon name="palette" size={40} />
    </div>
    <h1>PaläddyFix</h1>
    <p class="tagline">
      Das Farbwerkzeug für Designer und Entwickler -- vollständig lokal,
      ohne Konto, ohne Tracker.
    </p>
    <p class="lead">
      Wähle links eine Ansicht oder lege direkt ein Bild ab. PaläddyFix
      extrahiert Paletten, prüft Kontraste, rechnet Farbräume um und
      exportiert in gängige Formate.
    </p>
    <div class="cta-row">
      <button type="button" class="btn btn-primary" onclick={onOpenPicker}>
        <Icon name="upload" size={14} />
        Bild öffnen
      </button>
      <button type="button" class="btn" onclick={() => ui.setLeft("drop")}>
        Zur Ablage-Fläche
      </button>
      <button type="button" class="btn" onclick={() => ui.setLeft("palettes")}>
        Paletten ansehen
      </button>
    </div>
  </div>

  <div class="features">
    {#each features as f (f.title)}
      <article class="feat">
        <div class="feat-icon"><Icon name={f.icon} size={18} /></div>
        <div class="feat-body">
          <h3>{f.title}</h3>
          <p>{f.text}</p>
        </div>
      </article>
    {/each}
  </div>

  <div class="hints">
    <span><kbd>⌘</kbd><kbd>V</kbd> Einfügen</span>
    <span><kbd>⌘</kbd><kbd>O</kbd> Datei öffnen</span>
    <span><kbd>Esc</kbd> Zurück</span>
  </div>
</div>

<style>
  .welcome {
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 48px 32px;
    align-items: center;
  }
  .intro {
    max-width: 720px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .big-logo {
    width: 72px;
    height: 72px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--accent);
    margin-bottom: 6px;
  }
  h1 {
    font-family: var(--font-display, var(--font-button));
    font-size: 32px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.5px;
  }
  .tagline {
    font-family: var(--font-button);
    font-size: 15px;
    color: var(--text);
    max-width: 560px;
    line-height: 1.5;
  }
  .lead {
    font-family: var(--font-button);
    font-size: 13px;
    color: var(--text-dim);
    max-width: 560px;
    line-height: 1.6;
    margin: 0;
  }

  .cta-row {
    display: flex;
    gap: 8px;
    margin-top: 14px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    max-width: 960px;
    width: 100%;
  }
  .feat {
    display: flex;
    gap: 12px;
    padding: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .feat-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
  }
  .feat-body {
    min-width: 0;
  }
  .feat h3 {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 4px;
    letter-spacing: 0.2px;
  }
  .feat p {
    font-family: var(--font-button);
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-dim);
    margin: 0;
  }

  .hints {
    display: flex;
    gap: 24px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-mute);
    letter-spacing: 0.5px;
    margin-top: 8px;
  }
  kbd {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    padding: 2px 6px;
    border-radius: 3px;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 10px;
    margin-right: 4px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 8px 16px;
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 500;
    border-radius: var(--radius-btn);
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
  }
  .btn:hover {
    border-color: var(--text);
    background: var(--surface-3);
  }
  .btn-primary {
    background: var(--text);
    color: var(--bg);
    border-color: var(--text);
    font-weight: 600;
  }
  .btn-primary:hover {
    opacity: 0.9;
    background: var(--text);
  }
</style>
