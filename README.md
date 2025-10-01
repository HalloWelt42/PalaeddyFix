# PaläddyFix

Ein Farbanalyse-Tool für Bilder -- läuft komplett im Browser, ohne Upload, ohne Backend.

## Was es tut

- Bilder per Drag & Drop, Clipboard-Paste oder Dateiauswahl einwerfen
- Farben zählen, nach Häufigkeit sortieren und gestapelt darstellen
- Mit median-cut auf eine wählbare Farbanzahl quantisieren
- Einzelne Farbe per Klick kopieren (HEX / RGB / HSL / OKLCH)
- Eye-Dropper direkt im Bild -- Hover zeigt Farbe, Klick kopiert
- Export als HEX-Liste, CSS Custom Properties, Tailwind-Config oder JSON
- Alle Bilder liegen lokal in IndexedDB, Einstellungen in localStorage
- Dark / Light / System-Theme

Fachbegriffe (median-cut, OKLCH, Delta E, Alpha, ...) sind im UI mit einem Fragezeichen gekennzeichnet und öffnen ein schwebendes Info-Panel mit einer kurzen Erklärung.

## Stack

- Svelte 5 mit TypeScript
- Vite als Build-Tool
- IndexedDB für Bilder und Analyse-Cache
- Web Worker für die Farbanalyse (UI bleibt responsiv auch bei großen Bildern)
- Prism für Syntax-Highlighting in Export-Snippets und Info-Panel
- Fonts lokal: Barlow (UI), JetBrains Mono (Zahlen/Codes), Quicksand (Buttons + Erklärtexte)

## Start

```bash
npm install
npm run dev
```

Die App läuft dann unter `http://localhost:5173/`.

## Projektstruktur

```
src/
├── lib/
│   ├── analysis/       median-cut, Farbräume, Worker
│   ├── components/     Svelte-Komponenten
│   ├── export/         Export-Formate
│   ├── import/         Drag/Drop, Clipboard, File-Picker
│   ├── info/           Fachbegriffe für das Info-Panel
│   ├── storage/        IndexedDB- und localStorage-Zugriff
│   └── stores/         Svelte-5-Runes-Stores
├── styles/             CSS-Variablen, Base-Styles
└── main.ts

mockups/                statische Design-Entwürfe (werden nicht gebaut)
public/fonts/           lokal eingebettete Schriften
version.json            aktuelle Version
```

## Tastaturkürzel

- `⌘ V` / `Ctrl V` -- Bild aus der Zwischenablage einfügen
- `⌘ O` / `Ctrl O` -- Dateiauswahl-Dialog öffnen
- `Esc` -- aktuelles Overlay schließen (Info-Panel, Einstellungen, oder zurück zur Galerie)

## Hinweise

- Keine externen CDNs zur Laufzeit -- alle Ressourcen sind lokal gebündelt
- Die App speichert nichts außerhalb deines Browsers
- Große Bilder werden vor der Analyse auf eine einstellbare Kantenlänge skaliert (Default 1024 px)
