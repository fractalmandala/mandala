import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex-svelte';
import remarkMath from 'remark-math';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { highlightWithFilename } from './src/lib/build/code-highlighter';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx', '.md'],
			remarkPlugins: [remarkMath],
			rehypePlugins: [
				rehypeSlug,
				[rehypeAutolinkHeadings, {
					behavior: 'append',
					properties: {
						className: ['heading-anchor'],
						'aria-label': 'Section link'
					}
				}],
				rehypeKatex
			],
			highlight: { highlighter: highlightWithFilename, optimise: true }
		})
	],
	extensions: ['.svelte', '.svx', '.md'],
	kit: {
		adapter: adapter({
			runtime: 'nodejs24.x'
		}),
		prerender: {
			handleHttpError: ({ status, path }) => {
				// Non-404 errors (50x, etc.) still fail the build.
				if (status !== 404) return 'fail';
				// This site links to many offline/internal plugin resources
				// (templates, models, references, skill docs) that aren't
				// published routes. Warn instead of failing so deploys aren't
				// blocked by known gaps.
				return 'warn';
			}
		},
		paths: {
			base: process.env.BASE_PATH?.startsWith('/') ? (process.env.BASE_PATH) : ''
		}
	}
};

export default config;
