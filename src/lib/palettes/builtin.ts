import { hexToRgb, type RGB } from "../analysis/convert";
import type { Palette } from "./schema";

function p(id: string, name: string, hexes: string[], meta?: { author?: string; description?: string }): Palette {
  const colors: RGB[] = hexes.map((h) => {
    const rgb = hexToRgb(h);
    if (!rgb) throw new Error(`Palette ${id}: ungültiger Hex ${h}`);
    return rgb;
  });
  return { id, name, colors, ...meta };
}

const solarized = p(
  "solarized",
  "Solarized",
  [
    "#002b36", "#073642", "#586e75", "#657b83",
    "#839496", "#93a1a1", "#eee8d5", "#fdf6e3",
    "#b58900", "#cb4b16", "#dc322f", "#d33682",
    "#6c71c4", "#268bd2", "#2aa198", "#859900",
  ],
  { author: "Ethan Schoonover" },
);

const dracula = p(
  "dracula",
  "Dracula",
  [
    "#282a36", "#44475a", "#6272a4", "#f8f8f2",
    "#8be9fd", "#50fa7b", "#ffb86c", "#ff79c6",
    "#bd93f9", "#ff5555", "#f1fa8c",
  ],
);

const nord = p(
  "nord",
  "Nord",
  [
    "#2e3440", "#3b4252", "#434c5e", "#4c566a",
    "#d8dee9", "#e5e9f0", "#eceff4",
    "#8fbcbb", "#88c0d0", "#81a1c1", "#5e81ac",
    "#bf616a", "#d08770", "#ebcb8b", "#a3be8c", "#b48ead",
  ],
);

const gruvbox = p(
  "gruvbox",
  "Gruvbox",
  [
    "#282828", "#3c3836", "#504945", "#665c54", "#7c6f64",
    "#fbf1c7", "#ebdbb2", "#d5c4a1", "#bdae93", "#a89984",
    "#cc241d", "#fb4934", "#98971a", "#b8bb26",
    "#d79921", "#fabd2f", "#458588", "#83a598",
    "#b16286", "#d3869b", "#689d6a", "#8ec07c",
    "#d65d0e", "#fe8019",
  ],
);

const monokai = p(
  "monokai",
  "Monokai",
  [
    "#272822", "#3e3d32", "#75715e", "#f8f8f2",
    "#f92672", "#fd971f", "#e6db74", "#a6e22e",
    "#66d9ef", "#ae81ff",
  ],
);

const oneDark = p(
  "one-dark",
  "One Dark",
  [
    "#282c34", "#3e4451", "#5c6370", "#abb2bf",
    "#e06c75", "#be5046", "#d19a66", "#e5c07b",
    "#98c379", "#56b6c2", "#61afef", "#c678dd",
  ],
);

const tailwindBase = p(
  "tailwind",
  "Tailwind Basis",
  [
    "#000000", "#ffffff",
    "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#84cc16", "#22c55e", "#10b981", "#14b8a6",
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
    "#f43f5e",
  ],
);

const material = p(
  "material",
  "Material Design",
  [
    "#f44336", "#e91e63", "#9c27b0", "#673ab7",
    "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
    "#009688", "#4caf50", "#8bc34a", "#cddc39",
    "#ffeb3b", "#ffc107", "#ff9800", "#ff5722",
    "#795548", "#607d8b", "#9e9e9e",
  ],
);

const palettes: Palette[] = [
  solarized,
  dracula,
  nord,
  gruvbox,
  monokai,
  oneDark,
  tailwindBase,
  material,
];

export function listBuiltinPalettes(): Palette[] {
  return palettes;
}

export function getBuiltinPalette(id: string): Palette | undefined {
  return palettes.find((pal) => pal.id === id);
}
