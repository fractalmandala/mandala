import { buildNav } from '$lib/docs/nav';
import type { PageLoad } from './$types';

export interface PostMeta {
	title?: string;
	description?: string;
	tags?: string[];
	date?: string;
}

const modules = import.meta.glob('/src/routes/posts/*.md', { eager: true });

export const load: PageLoad = () => {
	const nav = buildNav(Object.keys(modules), '/posts');
	const posts = Object.entries(modules)
		.map(([path, mod]) => ({
			href: path.replace(/^\/src\/routes/, '').replace(/\.md$/, ''),
			meta: ((mod as { metadata?: PostMeta }).metadata ?? {}) as PostMeta
		}))
		.sort((a, b) => String(b.meta.date ?? '').localeCompare(String(a.meta.date ?? '')));
	return { nav, posts };
};
