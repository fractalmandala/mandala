import type { CatalogEntry, CatalogSummary } from './types';
import { listDocs } from './catalog';

/** Reading order for humans on the site (content sourced from packages/fractal-agentic). */
export const DOCS_SEQUENCE: string[] = [
	'guide',
	'00-overview',
	'01-getting-started',
	'02-install',
	'03-auto-use',
	'orchestration',
	'orchestration/runtime',
	'orchestration/capability-lanes',
	'progression',
	'handoffs',
	'bosses',
	'bosses/design',
	'bosses/code',
	'bosses/agent',
	'bosses/svelte',
	'bosses/creator',
	'bosses/workflow',
	'bosses/meta',
	'armory',
	'armory/skills',
	'armory/agents',
	'armory/commands',
	'wiki',
	'wiki/setup',
	'wiki/operations',
	'wiki/schema',
	'hooks',
	'self-improvement',
	'scheduled-essays',
	'troubleshooting',
	'glossary',
	'scripts',
	'doc-ownership',
	'soul',
	'agents',
	'customize',
	'readme',
	'troubleshooting-root',
	'integration-snippet'
];

export interface NavLink {
	href: string;
	label: string;
	slug?: string;
}

export interface NavSection {
	title: string;
	items: NavLink[];
}

export interface PrevNext {
	prev: CatalogSummary | null;
	next: CatalogSummary | null;
	/** Zero-based index in sequence */
	index: number;
	total: number;
}


export function listDocsInSequence(): CatalogEntry[] {
	const all = listDocs();
	const bySlug = new Map(all.map((d) => [d.slug, d]));
	const ordered: CatalogEntry[] = [];
	const seen = new Set<string>();

	for (const slug of DOCS_SEQUENCE) {
		const entry = bySlug.get(slug);
		if (entry) {
			ordered.push(entry);
			seen.add(slug);
		}
	}

	// Any new docs not yet in sequence — alphabetical after sequenced set
	const rest = all.filter((d) => !seen.has(d.slug)).sort((a, b) => a.slug.localeCompare(b.slug));
	return [...ordered, ...rest];
}
