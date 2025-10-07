---
title: Alpha-Kanal
subtitle: Transparenz im Bild
wikipedia: https://de.wikipedia.org/wiki/Alphakanal
---

PNG- und WEBP-Bilder können einen Alpha-Kanal enthalten: einen zusätzlichen Wert pro Pixel, der angibt, wie durchsichtig dieses Pixel ist. `0` bedeutet vollständig unsichtbar, `255` vollständig deckend.

## In PaläddyFix

- **Ignorieren:** durchsichtige Pixel fallen aus der Analyse raus -- saubere Paletten für Icons mit Rand.
- **Als Faktor:** durchsichtige Pixel werden mit ihrem Alpha-Anteil gewichtet -- passender für Fotos mit leichten Kanten.
