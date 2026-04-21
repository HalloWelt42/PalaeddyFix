# PaläddyFix

### 👉 [Live-Demo: hallowelt42.github.io/PalaeddyFix](https://hallowelt42.github.io/PalaeddyFix/)

Ein Farbanalyse- und Paletten-Werkzeug für Bilder -- läuft komplett im Browser, ohne Upload, ohne Backend, ohne Tracker.

![Bildschirmfoto 2026-04-21 um 09.59.41.png](docs/Bildschirmfoto%202026-04-21%20um%2009.59.41.png)

## Überblick

PaläddyFix nimmt ein Bild, zerlegt es in Farben, vergleicht es mit bekannten Paletten und exportiert die Ergebnisse in zahlreiche Formate. Alle Daten bleiben lokal im Browser (IndexedDB für Bilder und Analyse-Cache, localStorage für Einstellungen).

## Features

### Import
- Drag-and-drop ins Fenster
- Cmd/Ctrl-V aus der Zwischenablage (Screenshots, kopierte Bilder)
- Dateiauswahl-Dialog
- Unterstützte Formate: PNG, JPG, WEBP, GIF, BMP
- Metadaten-Parser (Bittiefe, Kanäle, DPI, Farbprofil, EXIF-Kamera) direkt beim Import

### Analyse
- **Häufigste Farben** per median-cut, 2--256 Slots
- **Seltenste Farben** als zweite Passung, um Ausreißer sichtbar zu machen
- **Kontrastreich** per Farthest-Point-Sampling über Delta E CIE2000
- **Zonal** -- Bild in N×N-Raster, pro Zelle Durchschnittsfarbe, zeigt räumliche Verteilung
- Sortierung nach Anteil, Helligkeit, Farbton oder Sättigung
- **Rechteck-Werkzeug** im Viewer -- jede Analyse lässt sich auf einen gewählten Bildausschnitt beschränken
- Kontrast-Matrix nach WCAG 2.1 mit AA/AAA-Bewertung pro Farbpaar

### Farb-Picker mit Ziellupe
- Pixel-genauer Eye-Dropper mit rundem Magnifier (12×-Zoom, Fadenkreuz)
- Zeigt Hex, gewähltes Format (RGB/HSL/OKLCH/Named) und Alpha in Prozent
- Klick kopiert den Wert in die Zwischenablage

### Paletten
- 16 eingebaute Design-Paletten (Solarized, Dracula, Nord, Gruvbox, Monokai, One Dark, Tokyo Night, Rosé Pine, Catppuccin, Tailwind, Material Design, ANSI-16, Web-Safe, CSS Named Colors)
- Eigene Paletten speichern, umbenennen, pinnen, einzelne Farben löschen
- **Arbeitspalette** -- kumulatives Sammeln aus Zonal-Regionen, per Drag sortierbar
- Paletten einklappen zum Vergleichen
- Stern-Marker aktiviert Paletten für Matcher und Snap-Tool

### Werkzeuge
- **Paletten-Matcher** -- welche Palette liegt am nächsten an den Bildfarben? (Delta E CIE2000)
- **Snap-to-Palette** -- Bild auf eine Zielpalette reduzieren, mit Floyd-Steinberg, Atkinson oder Bayer-Dithering
- **Kontrastmatrix** als eigene Vollansicht

### Export
Quelle wählbar: Analyse (Häufigste/Seltenste), Arbeitspalette oder eine der eigenen Paletten. Formate:

- Daten: HEX-Liste, JSON, CSV
- Web: CSS Custom Properties, SCSS, LESS, Tailwind Config
- Native: Swift (`UIColor`/SwiftUI), Kotlin (Compose), Dart (Flutter), Python
- Werkzeuge: GIMP Palette (`.gpl`), SVG Swatches

Der Code-Block zeigt links neben jeder Zeile die erkannte Farbe als kleinen Gutter-Kasten -- wie in modernen Editoren. Alpha-Werte werden je nach Format korrekt abgebildet (rgba, 8-stelliger Hex, Opacity, `0xAARRGGBB`, etc.).

### Info-Lexikon
- Eigene Artikel zu Fachbegriffen und allen eingebauten Paletten
- Inline-InfoLinks öffnen ein schwebendes Kurz-Panel
- Das Lexikon-Icon links unten öffnet eine Volltext-Suche mit Trefferzählung, Enter-Navigation und Auto-Scroll
- Wikipedia-Vollartikel werden passend nachgeladen, lokal 30 Tage gecacht, mit CC-BY-SA-Hinweis
- Beim App-Start werden alle verknüpften Wikipedia-Artikel vorbefüllt, damit die Suche offline funktioniert

### Sonstiges
- Dark / Light / System-Theme
- WCAG-Kontrastanalyse und Delta-E-Abstand direkt integriert
- Alle Fonts (Barlow, JetBrains Mono, Quicksand) lokal ausgeliefert
- Keine CDNs, keine Analytics, keine Tracker

## Technik

- **Svelte 5** mit Runes (`$state`, `$derived`, `$effect`)
- **TypeScript** strict
- **Vite** als Build-Tool
- **IndexedDB** für Bilder, Analysen und Wikipedia-Cache
- **Web Worker** für die Farbanalyse
- **Prism** für Syntax-Highlighting im Export
- **Marked** für Markdown im Info-Panel

## Start

```bash
npm install
npm run dev
```

Die App läuft unter `http://localhost:5173/`.

## Build

```bash
npm run build
npm run preview
```

Der Build landet in `dist/` und lässt sich statisch ausliefern. Für GitHub Pages wird der Pfad in `vite.config.ts` automatisch auf `/PalaeddyFix/` gesetzt.

## GitHub Pages

Ein Workflow in `.github/workflows/deploy.yml` baut die App bei jedem Push auf `main` und deployed sie zu GitHub Pages. In den Repo-Einstellungen muss **Pages → Source → GitHub Actions** aktiviert sein.

## Projektstruktur

```
src/
├── lib/
│   ├── analysis/       median-cut, Farbräume, Worker, Zonal, Distinct
│   ├── components/     Svelte-Komponenten
│   ├── export/         Export-Formate
│   ├── import/         Drag/Drop, Clipboard, File-Picker, Metadaten
│   ├── info/           Fachbegriffe, Wikipedia-Cache
│   ├── palettes/       eingebaute Paletten + Matching
│   ├── storage/        IndexedDB + localStorage
│   └── stores/         Svelte-5-Runes-Stores
├── styles/             CSS-Variablen, Base-Styles
└── main.ts

.github/workflows/      GitHub-Actions (Build + Pages-Deploy)
public/                 statische Assets (Fonts, Icons, QR-Codes)
version.json            aktuelle Version
```

## Tastaturkürzel

- `⌘ V` / `Ctrl V` -- Bild aus der Zwischenablage einfügen
- `⌘ O` / `Ctrl O` -- Dateiauswahl-Dialog öffnen
- `Esc` -- aktuelles Overlay schließen
- Im Lexikon: `↵` springt zum nächsten Treffer, `⇧ ↵` zum vorherigen

## Lizenz

Nicht-kommerzielles Open-Source-Projekt. Font-Lizenzen siehe `public/fonts/`.
