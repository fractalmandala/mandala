import { getComponent } from "$lib/docs/registry.js";
import { loadDoc } from "$lib/docs/load.js";
import type { PageLoad } from "./$types.js";

export const load: PageLoad = ({ params }) => loadDoc(params.slug, getComponent(params.slug));
