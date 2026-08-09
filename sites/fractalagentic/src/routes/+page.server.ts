import { getArmoryStats, getPackageVersion, listBosses, listWorkflows } from '$lib/content/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const stats = getArmoryStats();
	return {
		bosses: listBosses(),
		counts: {
			skills: stats.skills,
			commands: stats.commands,
			agents: stats.agents,
			workflows: listWorkflows().length
		},
		version: getPackageVersion()
	};
};
