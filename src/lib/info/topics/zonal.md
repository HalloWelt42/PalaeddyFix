---
title: Zonale Farben
subtitle: Durchschnittsfarbe pro Bildregion
wikipedia: https://de.wikipedia.org/wiki/Skalierung_(Computergrafik)
---

Die zonale Analyse teilt das Bild in ein gleichmäßiges N×N-Raster und berechnet pro Zelle die Durchschnittsfarbe. Anders als Häufigste oder Seltenste zeigt sie, **wo** im Bild welche Farben sitzen, nicht nur welche.

## Wofür es gut ist

- **Mood-Boards**: Man sieht auf einen Blick, ob ein Bild warm oben und kühl unten ist, ob eine Ecke dominiert oder der Bildaufbau symmetrisch wirkt.
- **Farbverteilung prüfen**: Für UI-Screenshots hilft es zu erkennen, ob Akzentfarben gleichmäßig verteilt sind oder sich in einer Ecke klumpen.
- **Farbverläufe ableiten**: Lineare Übergänge (Himmel, Hintergründe) werden als feine Tonabstufung sichtbar, die sich direkt als Gradient-Palette nutzen lässt.
- **Kompositions-Analyse**: In der Malerei und Fotografie lässt sich so die „Farbblock-Struktur" eines Bildes lesen, ähnlich wie ein Pixel-Art-Mosaik.

## Wie es funktioniert

- Das Bild wird auf N×N Pixel heruntergerechnet, wobei der Browser bilinear interpoliert.
- Jede resultierende Pixelstelle ist die gewichtete Durchschnittsfarbe der darunterliegenden Region.
- Das Ergebnis ist ein Mosaik, das die grobe Farbstruktur des Bildes wiedergibt.

## Rastergröße

- **Kleines Raster** (2×2 bis 4×4): zeigt die grobe Balance zwischen Bildvierteln oder -kreuzen.
- **Mittleres Raster** (6×6 bis 10×10): sinnvolle Auflösung für die meisten Fotos -- feine genug, um Objekte zu erahnen, grob genug, um Farbblöcke zu sehen.
- **Großes Raster** (16×16 und mehr): nähert sich einer Pixel-Art-Darstellung an und eignet sich zum Ableiten von Tile- oder Gradient-Paletten.

## Dedup beim Speichern

Beim Speichern als Palette werden perzeptiv sehr ähnliche Zonen zu einer Farbe zusammengefasst (Delta E CIE2000), sodass keine 64 fast identischen Einträge entstehen.
