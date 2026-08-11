import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createAcrollsMdsvexPreprocessor } from '@acrolls/mdsvex';

  
  const acrolls = createAcrollsMdsvexPreprocessor({
    extensions: ['.md', '.svx'],
    // For an existing corpus only, opt in deliberately:
    // onInvalidDocument: 'error-page'
  });

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [vitePreprocess(), acrolls],
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	},
};

export default config;
