import { hexToRgb, type RGB } from "../analysis/convert";
import type { Palette } from "./schema";

function p(
  id: string,
  name: string,
  hexes: string[],
  meta?: {
    author?: string;
    description?: string;
    infoTopic?: string;
  },
): Palette {
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
  { author: "Ethan Schoonover", infoTopic: "palette-solarized" },
);

const dracula = p(
  "dracula",
  "Dracula",
  [
    "#282a36", "#44475a", "#6272a4", "#f8f8f2",
    "#8be9fd", "#50fa7b", "#ffb86c", "#ff79c6",
    "#bd93f9", "#ff5555", "#f1fa8c",
  ],
  { author: "Zeno Rocha", infoTopic: "palette-dracula" },
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
  { author: "Arctic Ice Studio", infoTopic: "palette-nord" },
);

const gruvboxDark = p(
  "gruvbox-dark",
  "Gruvbox Dark",
  [
    "#1d2021", "#282828", "#32302f",
    "#3c3836", "#504945", "#665c54", "#7c6f64",
    "#928374", "#a89984", "#bdae93", "#d5c4a1", "#ebdbb2", "#fbf1c7",
    "#cc241d", "#fb4934",
    "#98971a", "#b8bb26",
    "#d79921", "#fabd2f",
    "#458588", "#83a598",
    "#b16286", "#d3869b",
    "#689d6a", "#8ec07c",
    "#d65d0e", "#fe8019",
  ],
  { author: "Pavel Pertsev", infoTopic: "palette-gruvbox" },
);

const gruvboxLight = p(
  "gruvbox-light",
  "Gruvbox Light",
  [
    "#f9f5d7", "#fbf1c7", "#f2e5bc",
    "#ebdbb2", "#d5c4a1", "#bdae93", "#a89984",
    "#928374", "#7c6f64", "#665c54", "#504945", "#3c3836", "#282828",
    "#9d0006", "#cc241d",
    "#79740e", "#98971a",
    "#b57614", "#d79921",
    "#076678", "#458588",
    "#8f3f71", "#b16286",
    "#427b58", "#689d6a",
    "#af3a03", "#d65d0e",
  ],
  { author: "Pavel Pertsev", infoTopic: "palette-gruvbox" },
);

const monokai = p(
  "monokai",
  "Monokai",
  [
    "#272822", "#3e3d32", "#49483e", "#75715e",
    "#f8f8f2", "#f8f8f0", "#cfcfc2",
    "#f92672", "#fd971f", "#e6db74",
    "#a6e22e", "#66d9ef", "#ae81ff",
  ],
  { author: "Wimer Hazenberg", infoTopic: "palette-monokai" },
);

const oneDark = p(
  "one-dark",
  "One Dark",
  [
    "#282c34", "#21252b", "#3e4451", "#4b5263",
    "#5c6370", "#abb2bf", "#9da5b4", "#ffffff",
    "#e06c75", "#be5046", "#d19a66", "#e5c07b",
    "#98c379", "#56b6c2", "#61afef", "#c678dd",
  ],
  { author: "Atom Material", infoTopic: "palette-one-dark" },
);

const tokyoNight = p(
  "tokyo-night",
  "Tokyo Night",
  [
    "#1a1b26", "#24283b", "#414868", "#565f89",
    "#a9b1d6", "#c0caf5",
    "#f7768e", "#ff9e64", "#e0af68",
    "#9ece6a", "#73daca", "#b4f9f8",
    "#2ac3de", "#7dcfff", "#7aa2f7",
    "#bb9af7", "#ff007c",
  ],
  { author: "Enkia", infoTopic: "palette-tokyo-night" },
);

const rosePine = p(
  "rose-pine",
  "Rosé Pine",
  [
    "#191724", "#1f1d2e", "#26233a", "#6e6a86",
    "#908caa", "#e0def4", "#eb6f92",
    "#f6c177", "#ebbcba", "#31748f",
    "#9ccfd8", "#c4a7e7", "#524f67",
  ],
  { author: "rose-pine.com", infoTopic: "palette-rose-pine" },
);

const catppuccinMocha = p(
  "catppuccin-mocha",
  "Catppuccin Mocha",
  [
    "#11111b", "#181825", "#1e1e2e", "#313244", "#45475a", "#585b70",
    "#6c7086", "#7f849c", "#9399b2", "#a6adc8", "#bac2de", "#cdd6f4",
    "#f5e0dc", "#f2cdcd", "#f5c2e7", "#cba6f7", "#f38ba8", "#eba0ac",
    "#fab387", "#f9e2af", "#a6e3a1", "#94e2d5", "#89dceb", "#74c7ec",
    "#89b4fa", "#b4befe",
  ],
  { author: "Catppuccin", infoTopic: "palette-catppuccin" },
);

const catppuccinLatte = p(
  "catppuccin-latte",
  "Catppuccin Latte",
  [
    "#dce0e8", "#e6e9ef", "#eff1f5", "#ccd0da", "#bcc0cc", "#acb0be",
    "#9ca0b0", "#8c8fa1", "#7c7f93", "#6c6f85", "#5c5f77", "#4c4f69",
    "#dc8a78", "#dd7878", "#ea76cb", "#8839ef", "#d20f39", "#e64553",
    "#fe640b", "#df8e1d", "#40a02b", "#179299", "#04a5e5", "#209fb5",
    "#1e66f5", "#7287fd",
  ],
  { author: "Catppuccin", infoTopic: "palette-catppuccin" },
);

const ansi16 = p(
  "ansi-16",
  "ANSI 16",
  [
    "#000000", "#800000", "#008000", "#808000",
    "#000080", "#800080", "#008080", "#c0c0c0",
    "#808080", "#ff0000", "#00ff00", "#ffff00",
    "#0000ff", "#ff00ff", "#00ffff", "#ffffff",
  ],
  { infoTopic: "palette-ansi" },
);

const webSafe = p(
  "web-safe",
  "Web-Safe 216",
  buildWebSafe(),
  { description: "Alle 216 web-sicheren Farben", infoTopic: "palette-web" },
);

function buildWebSafe(): string[] {
  const out: string[] = [];
  const steps = ["00", "33", "66", "99", "cc", "ff"];
  for (const r of steps) for (const g of steps) for (const b of steps) out.push(`#${r}${g}${b}`);
  return out;
}

const cssNamed = p(
  "css-named",
  "CSS Named Colors",
  [
    "#f0f8ff", "#faebd7", "#00ffff", "#7fffd4", "#f0ffff", "#f5f5dc",
    "#ffe4c4", "#000000", "#ffebcd", "#0000ff", "#8a2be2", "#a52a2a",
    "#deb887", "#5f9ea0", "#7fff00", "#d2691e", "#ff7f50", "#6495ed",
    "#fff8dc", "#dc143c", "#00008b", "#008b8b", "#b8860b", "#a9a9a9",
    "#006400", "#bdb76b", "#8b008b", "#556b2f", "#ff8c00", "#9932cc",
    "#8b0000", "#e9967a", "#8fbc8f", "#483d8b", "#2f4f4f", "#00ced1",
    "#9400d3", "#ff1493", "#00bfff", "#696969", "#1e90ff", "#b22222",
    "#fffaf0", "#228b22", "#ff00ff", "#dcdcdc", "#f8f8ff", "#ffd700",
    "#daa520", "#808080", "#008000", "#adff2f", "#f0fff0", "#ff69b4",
    "#cd5c5c", "#4b0082", "#fffff0", "#f0e68c", "#e6e6fa", "#fff0f5",
    "#7cfc00", "#fffacd", "#add8e6", "#f08080", "#e0ffff", "#fafad2",
    "#d3d3d3", "#90ee90", "#ffb6c1", "#ffa07a", "#20b2aa", "#87cefa",
    "#778899", "#b0c4de", "#ffffe0", "#00ff00", "#32cd32", "#faf0e6",
    "#800000", "#66cdaa", "#0000cd", "#ba55d3", "#9370db", "#3cb371",
    "#7b68ee", "#00fa9a", "#48d1cc", "#c71585", "#191970", "#f5fffa",
    "#ffe4e1", "#ffe4b5", "#ffdead", "#000080", "#fdf5e6", "#808000",
    "#6b8e23", "#ffa500", "#ff4500", "#da70d6", "#eee8aa", "#98fb98",
    "#afeeee", "#db7093", "#ffefd5", "#ffdab9", "#cd853f", "#ffc0cb",
    "#dda0dd", "#b0e0e6", "#800080", "#663399", "#ff0000", "#bc8f8f",
    "#4169e1", "#8b4513", "#fa8072", "#f4a460", "#2e8b57", "#fff5ee",
    "#a0522d", "#c0c0c0", "#87ceeb", "#6a5acd", "#708090", "#fffafa",
    "#00ff7f", "#4682b4", "#d2b48c", "#008080", "#d8bfd8", "#ff6347",
    "#40e0d0", "#ee82ee", "#f5deb3", "#ffffff", "#f5f5f5", "#ffff00",
    "#9acd32",
  ],
  { infoTopic: "palette-web" },
);

function tw(prefix: string, shades: [number, string][]): string[] {
  return shades.map(([, hex]) => hex);
}

const tailwindFull = p(
  "tailwind-full",
  "Tailwind CSS (voll)",
  [
    "#000000", "#ffffff",
    // slate
    "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8",
    "#64748b", "#475569", "#334155", "#1e293b", "#0f172a", "#020617",
    // gray
    "#f9fafb", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af",
    "#6b7280", "#4b5563", "#374151", "#1f2937", "#111827", "#030712",
    // zinc
    "#fafafa", "#f4f4f5", "#e4e4e7", "#d4d4d8", "#a1a1aa",
    "#71717a", "#52525b", "#3f3f46", "#27272a", "#18181b", "#09090b",
    // neutral
    "#fafafa", "#f5f5f5", "#e5e5e5", "#d4d4d4", "#a3a3a3",
    "#737373", "#525252", "#404040", "#262626", "#171717", "#0a0a0a",
    // stone
    "#fafaf9", "#f5f5f4", "#e7e5e4", "#d6d3d1", "#a8a29e",
    "#78716c", "#57534e", "#44403c", "#292524", "#1c1917", "#0c0a09",
    // red
    "#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171",
    "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#450a0a",
    // orange
    "#fff7ed", "#ffedd5", "#fed7aa", "#fdba74", "#fb923c",
    "#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12", "#431407",
    // amber
    "#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24",
    "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f", "#451a03",
    // yellow
    "#fefce8", "#fef9c3", "#fef08a", "#fde047", "#facc15",
    "#eab308", "#ca8a04", "#a16207", "#854d0e", "#713f12", "#422006",
    // lime
    "#f7fee7", "#ecfccb", "#d9f99d", "#bef264", "#a3e635",
    "#84cc16", "#65a30d", "#4d7c0f", "#3f6212", "#365314", "#1a2e05",
    // green
    "#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80",
    "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d", "#052e16",
    // emerald
    "#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399",
    "#10b981", "#059669", "#047857", "#065f46", "#064e3b", "#022c22",
    // teal
    "#f0fdfa", "#ccfbf1", "#99f6e4", "#5eead4", "#2dd4bf",
    "#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a", "#042f2e",
    // cyan
    "#ecfeff", "#cffafe", "#a5f3fc", "#67e8f9", "#22d3ee",
    "#06b6d4", "#0891b2", "#0e7490", "#155e75", "#164e63", "#083344",
    // sky
    "#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8",
    "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e", "#082f49",
    // blue
    "#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa",
    "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554",
    // indigo
    "#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8",
    "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81", "#1e1b4b",
    // violet
    "#f5f3ff", "#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa",
    "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#2e1065",
    // purple
    "#faf5ff", "#f3e8ff", "#e9d5ff", "#d8b4fe", "#c084fc",
    "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87", "#3b0764",
    // fuchsia
    "#fdf4ff", "#fae8ff", "#f5d0fe", "#f0abfc", "#e879f9",
    "#d946ef", "#c026d3", "#a21caf", "#86198f", "#701a75", "#4a044e",
    // pink
    "#fdf2f8", "#fce7f3", "#fbcfe8", "#f9a8d4", "#f472b6",
    "#ec4899", "#db2777", "#be185d", "#9d174d", "#831843", "#500724",
    // rose
    "#fff1f2", "#ffe4e6", "#fecdd3", "#fda4af", "#fb7185",
    "#f43f5e", "#e11d48", "#be123c", "#9f1239", "#881337", "#4c0519",
  ],
  {
    description: "Alle 22 Farbfamilien × 11 Shades + Schwarz/Weiß",
    infoTopic: "palette-tailwind",
  },
);

const materialFull = p(
  "material-full",
  "Material Design (voll)",
  [
    // Red
    "#ffebee", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#f44336",
    "#e53935", "#d32f2f", "#c62828", "#b71c1c",
    "#ff8a80", "#ff5252", "#ff1744", "#d50000",
    // Pink
    "#fce4ec", "#f8bbd0", "#f48fb1", "#f06292", "#ec407a", "#e91e63",
    "#d81b60", "#c2185b", "#ad1457", "#880e4f",
    "#ff80ab", "#ff4081", "#f50057", "#c51162",
    // Purple
    "#f3e5f5", "#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc", "#9c27b0",
    "#8e24aa", "#7b1fa2", "#6a1b9a", "#4a148c",
    "#ea80fc", "#e040fb", "#d500f9", "#aa00ff",
    // Deep Purple
    "#ede7f6", "#d1c4e9", "#b39ddb", "#9575cd", "#7e57c2", "#673ab7",
    "#5e35b1", "#512da8", "#4527a0", "#311b92",
    "#b388ff", "#7c4dff", "#651fff", "#6200ea",
    // Indigo
    "#e8eaf6", "#c5cae9", "#9fa8da", "#7986cb", "#5c6bc0", "#3f51b5",
    "#3949ab", "#303f9f", "#283593", "#1a237e",
    "#8c9eff", "#536dfe", "#3d5afe", "#304ffe",
    // Blue
    "#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3",
    "#1e88e5", "#1976d2", "#1565c0", "#0d47a1",
    "#82b1ff", "#448aff", "#2979ff", "#2962ff",
    // Light Blue
    "#e1f5fe", "#b3e5fc", "#81d4fa", "#4fc3f7", "#29b6f6", "#03a9f4",
    "#039be5", "#0288d1", "#0277bd", "#01579b",
    "#80d8ff", "#40c4ff", "#00b0ff", "#0091ea",
    // Cyan
    "#e0f7fa", "#b2ebf2", "#80deea", "#4dd0e1", "#26c6da", "#00bcd4",
    "#00acc1", "#0097a7", "#00838f", "#006064",
    "#84ffff", "#18ffff", "#00e5ff", "#00b8d4",
    // Teal
    "#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688",
    "#00897b", "#00796b", "#00695c", "#004d40",
    "#a7ffeb", "#64ffda", "#1de9b6", "#00bfa5",
    // Green
    "#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a", "#4caf50",
    "#43a047", "#388e3c", "#2e7d32", "#1b5e20",
    "#b9f6ca", "#69f0ae", "#00e676", "#00c853",
    // Light Green
    "#f1f8e9", "#dcedc8", "#c5e1a5", "#aed581", "#9ccc65", "#8bc34a",
    "#7cb342", "#689f38", "#558b2f", "#33691e",
    "#ccff90", "#b2ff59", "#76ff03", "#64dd17",
    // Lime
    "#f9fbe7", "#f0f4c3", "#e6ee9c", "#dce775", "#d4e157", "#cddc39",
    "#c0ca33", "#afb42b", "#9e9d24", "#827717",
    "#f4ff81", "#eeff41", "#c6ff00", "#aeea00",
    // Yellow
    "#fffde7", "#fff9c4", "#fff59d", "#fff176", "#ffee58", "#ffeb3b",
    "#fdd835", "#fbc02d", "#f9a825", "#f57f17",
    "#ffff8d", "#ffff00", "#ffea00", "#ffd600",
    // Amber
    "#fff8e1", "#ffecb3", "#ffe082", "#ffd54f", "#ffca28", "#ffc107",
    "#ffb300", "#ffa000", "#ff8f00", "#ff6f00",
    "#ffe57f", "#ffd740", "#ffc400", "#ffab00",
    // Orange
    "#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726", "#ff9800",
    "#fb8c00", "#f57c00", "#ef6c00", "#e65100",
    "#ffd180", "#ffab40", "#ff9100", "#ff6d00",
    // Deep Orange
    "#fbe9e7", "#ffccbc", "#ffab91", "#ff8a65", "#ff7043", "#ff5722",
    "#f4511e", "#e64a19", "#d84315", "#bf360c",
    "#ff9e80", "#ff6e40", "#ff3d00", "#dd2c00",
    // Brown (keine Akzent-Varianten)
    "#efebe9", "#d7ccc8", "#bcaaa4", "#a1887f", "#8d6e63", "#795548",
    "#6d4c41", "#5d4037", "#4e342e", "#3e2723",
    // Gray
    "#fafafa", "#f5f5f5", "#eeeeee", "#e0e0e0", "#bdbdbd", "#9e9e9e",
    "#757575", "#616161", "#424242", "#212121",
    // Blue Gray
    "#eceff1", "#cfd8dc", "#b0bec5", "#90a4ae", "#78909c", "#607d8b",
    "#546e7a", "#455a64", "#37474f", "#263238",
  ],
  {
    description: "Alle 19 Farbfamilien mit allen Shades und Akzentvarianten",
    infoTopic: "palette-material",
  },
);

const palettes: Palette[] = [
  solarized,
  dracula,
  nord,
  gruvboxDark,
  gruvboxLight,
  monokai,
  oneDark,
  tokyoNight,
  rosePine,
  catppuccinMocha,
  catppuccinLatte,
  tailwindFull,
  materialFull,
  ansi16,
  webSafe,
  cssNamed,
];

export function listBuiltinPalettes(): Palette[] {
  return palettes;
}

export function getBuiltinPalette(id: string): Palette | undefined {
  return palettes.find((pal) => pal.id === id);
}
