import { getSiteConfig } from '$lib/server/config';
import { getNavGroups } from '$lib/server/vault';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const siteConfig = getSiteConfig();
	const navGroups = getNavGroups();

	return {
		siteConfig,
		navGroups
	};
};
