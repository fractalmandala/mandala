import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import fractalsStyler from 'fractals-styler';
import tailwindcss from '@tailwindcss/vite';
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";

// Vite handles --host / --port CLI passthrough natively, so `pnpm dev --port 7100`
// works for preview harnesses. Default port 1420 matches tauri.conf.json devUrl.
export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), fractalsStyler(), sveltePhosphorOptimize()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: false,
    host: true
  },
  build: {
    target: 'es2022'
  }
});
