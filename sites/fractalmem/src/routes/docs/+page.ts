import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { docs } = await parent();
	const first = docs[0];

	if (first) {
		redirect(307, resolve('/docs/[doc]', { doc: first.slug }));
	}
};
