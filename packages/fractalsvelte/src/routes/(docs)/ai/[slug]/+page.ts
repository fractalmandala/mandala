import { getAiComponent } from "$lib/docs/ai-registry.js";
import { loadDoc } from "$lib/docs/load.js";
import type { PageLoad } from "./$types.js";

export const load: PageLoad = ({ params }) => {
	const ai = getAiComponent(params.slug);
	const entry =
		ai && {
			slug: ai.slug,
			name: ai.name,
			wave: ai.wave,
			status: ai.status,
			deps: [...ai.uiDeps, ...ai.aiElementDeps],
			external: ai.external.length ? ai.external.join(", ") : undefined,
		};
	return loadDoc(params.slug, entry);
};
