import { error } from "@sveltejs/kit";

// Doc pages live under src/content/{components,blocks}/, compiled by mdsvex and resolved by glob.
// Core and AI-element slugs share the components/ namespace (they don't collide).
// Blocks use a separate folder so layout demos never shadow a component slug.
const componentPages = import.meta.glob("/src/content/components/*.md");
const blockPages = import.meta.glob("/src/content/blocks/*.md");

export type DocEntry = {
	slug: string;
	name: string;
	wave: number;
	status: string;
	deps?: string[];
	external?: string;
};

export type DocKind = "component" | "block";

export async function loadDoc(
	slug: string,
	entry: DocEntry | undefined,
	kind: DocKind = "component"
) {
	if (!entry) error(404, `Unknown ${kind}: ${slug}`);
	const pages = kind === "block" ? blockPages : componentPages;
	const path =
		kind === "block"
			? `/src/content/blocks/${slug}.md`
			: `/src/content/components/${slug}.md`;
	const resolver = pages[path];
	if (!resolver) {
		// In the registry but not yet written — render the placeholder rather than 404.
		return { entry, content: null };
	}
	const mod = (await resolver()) as { default: unknown; metadata?: Record<string, unknown> };
	return { entry, content: mod.default, metadata: mod.metadata ?? {} };
}
