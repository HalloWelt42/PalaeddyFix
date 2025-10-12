import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  base: mode === "production" ? "/PalaeddyFix/" : "/",
  server: {
    port: 5173,
  },
}));
