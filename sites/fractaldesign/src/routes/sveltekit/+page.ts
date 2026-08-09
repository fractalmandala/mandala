import { redirect } from '@sveltejs/kit';
import { buildNav } from '$lib/docs/nav';
import type { PageLoad } from './$types';

const modules = import.meta.glob([
	'/src/routes/sveltekit/**/*.md',
	'!/src/routes/sveltekit/svelte-motion/**',
	'!**/.generated/**'
]);

// Land on the first available doc in the nav tree.
function firstHref(items: ReturnType<typeof buildNav>): string | undefined {
	for (const item of items) {
		if (item.href) return item.href;
		const child = firstHref(item.items);
		if (child) return child;
	}
}

export const load: PageLoad = () => {
	const nav = buildNav(Object.keys(modules), '/sveltekit');
	throw redirect(307, firstHref(nav) ?? '/');
};
