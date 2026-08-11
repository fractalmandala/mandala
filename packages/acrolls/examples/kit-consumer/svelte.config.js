import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createAcrollsSvelteKitMdsvexPreprocessor } from '@acrolls/sveltekit';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const layout = join(root, '../../packages/svelte/src/lib/PublicationLayout.svelte');

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [
    vitePreprocess(),
    createAcrollsSvelteKitMdsvexPreprocessor({ layout: { _: layout } })
  ],
  kit: {
    adapter: adapter()
  }
};

export default config;
