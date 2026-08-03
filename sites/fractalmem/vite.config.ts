import { sveltekit } from '@sveltejs/kit/vite';
import fractalsStyler from 'fractals-styler';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), fractalsStyler()]
});
