import { buildNav } from '$lib/docs/nav';
import type { LayoutLoad } from './$types';

const modules = import.meta.glob([
	'/src/routes/sveltekit/**/*.md',
	'!/src/routes/sveltekit/svelte-motion/**',
	'!**/.generated/**'
]);

export const load: LayoutLoad = () => {
	return { nav: buildNav(Object.keys(modules), '/sveltekit') };
};
