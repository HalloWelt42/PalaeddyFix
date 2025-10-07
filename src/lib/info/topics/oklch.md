---
title: OKLCH
subtitle: Moderner Farbraum für CSS
wikipedia: https://en.wikipedia.org/wiki/Oklab_color_space
---

OKLCH ist ein wahrnehmungsbasierter Farbraum, der seit 2023 in allen gängigen Browsern direkt in CSS nutzbar ist. Er beschreibt Farben mit drei Werten:

- **L** -- Helligkeit (0 bis 1, perzeptiv linear)
- **C** -- Chroma (Farbintensität, 0 bis ca. 0.4)
- **H** -- Farbwinkel (0 bis 360 Grad)

Der Vorteil gegenüber HSL: Änderungen der Helligkeit bleiben visuell konsistent, unabhängig vom Farbton.

```css
color: oklch(0.78 0.04 240);
```
