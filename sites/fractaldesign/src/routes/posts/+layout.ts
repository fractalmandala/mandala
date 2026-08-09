import { buildNav } from '$lib/docs/nav';
import type { LayoutLoad } from './$types';

const modules = import.meta.glob('/src/routes/posts/*.md');

export const load: LayoutLoad = () => {
	return { nav: buildNav(Object.keys(modules), '/posts') };
};
