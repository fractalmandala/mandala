import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import type { PageLoad } from './$types';

const modules = import.meta.glob<{ default: Component; metadata?: Record<string, unknown> }>([
	'/src/routes/sveltekit/**/*.md',
	'!/src/routes/sveltekit/svelte-motion/**',
	'!**/.generated/**'
]);

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug;
	const candidates = [
		`/src/routes/sveltekit/${slug}.md`,
		`/src/routes/sveltekit/${slug}/index.md`
	];
	const key = candidates.find((k) => modules[k]);
	if (!key) throw error(404, `Doc "${slug}" not found`);

	const fallbackTitle = slug.split('/').pop()?.replace(/^\d+[-.]?/, '') ?? slug;

	// Some upstream docs import demo components / packages that aren't present
	// in this app. Degrade to a notice instead of crashing the whole section.
	try {
		const mod = await modules[key]();
		return {
			content: mod.default,
			title: (mod.metadata?.title as string) ?? fallbackTitle,
			description: (mod.metadata?.description as string) ?? '',
			renderError: null as string | null
		};
	} catch (e) {
		return {
			content: null,
			title: fallbackTitle,
			description: '',
			renderError: e instanceof Error ? e.message : String(e)
		};
	}
};
