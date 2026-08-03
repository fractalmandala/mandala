import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import fractalsStyler from 'fractals-styler';
import { defineConfig } from 'vite';

const siteRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(siteRoot, '..');
const pluginRoot = path.resolve(repoRoot, 'plugin');

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				// Local Node may be newer than Vercel's default matrix; pin a supported runtime.
				runtime: 'nodejs24.x'
			}),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md'],
			// Armory markdown contains many relative paths to nested reference files
			// that are not yet separate explorer routes — don't fail the static build.
			prerender: {
				handleHttpError: 'warn',
				handleMissingId: 'ignore',
				handleUnseenRoutes: 'ignore'
			}
		}),
		fractalsStyler()
	],
	server: {
		fs: {
			// Allow reading the sibling plugin armory during dev.
			allow: [siteRoot, pluginRoot, repoRoot]
		}
	}
});
