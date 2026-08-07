import { getAllDocs } from '$lib/docs/content-list';

export function load() {
	// Server-only list items (no raw bodies in the response beyond meta fields).
	return {
		docs: getAllDocs()
	};
}
