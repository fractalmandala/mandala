import { redirect } from '@sveltejs/kit';
import { buildNav } from '$lib/docs/nav';
import type { PageLoad } from './$types';

const modules = import.meta.glob('/src/routes/posts/*.md');

export const load: PageLoad = () => {
	const nav = buildNav(Object.keys(modules), '/posts');
	const first = nav.find((n) => n.href)?.href;
	throw redirect(307, first ?? '/');
};
