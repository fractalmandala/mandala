import type { CatalogEntry, CatalogKind, CatalogSummary } from './types';
import {
	getAgent,
	getCommand,
	getDoc,
	getSkill,
	listAgents,
	listCommands,
	listDocs,
	listSkills,
	toSummaries
} from './catalog';

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
	'degradation',
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


function shortDocLabel(d: CatalogEntry, fallback: string): string {
	// Prefer short titles without " — " suffix for sidebar density
	const t = d.title.split('—')[0]?.trim() || d.title;
	if (t.length > 36) return fallback;
	// Drop leading numeric prefixes for cleaner nav
	return t.replace(/^\d+[.\s-]+/, '') || fallback;
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
