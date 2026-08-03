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

/** Reading order for humans on the site (content still sourced from plugin/). */
export const DOCS_SEQUENCE: string[] = [
	'guide',
	'00-overview',
	'01-getting-started',
	'02-install',
	'03-auto-use',
	'orchestration',
	'orchestration/runtime',
	'orchestration/capability-lanes',
	'DEGRADATION',
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

function listForKind(kind: CatalogKind): CatalogEntry[] {
	switch (kind) {
		case 'skill':
			return listSkills();
		case 'agent':
			return listAgents();
		case 'command':
			return listCommands();
		case 'doc':
			return listDocsInSequence();
	}
}

export function getEntry(kind: CatalogKind, slug: string): CatalogEntry | undefined {
	switch (kind) {
		case 'skill':
			return getSkill(slug);
		case 'agent':
			return getAgent(slug);
		case 'command':
			return getCommand(slug);
		case 'doc':
			return getDoc(slug);
	}
}

export function getPrevNext(kind: CatalogKind, slug: string): PrevNext {
	const list = listForKind(kind);
	const index = list.findIndex((e) => e.slug === slug);
	if (index === -1) {
		return { prev: null, next: null, index: -1, total: list.length };
	}
	const summaries = toSummaries(list);
	return {
		prev: index > 0 ? summaries[index - 1]! : null,
		next: index < list.length - 1 ? summaries[index + 1]! : null,
		index,
		total: list.length
	};
}

/** Sidebar navigation for the documentation site. */
export function getSidebarNav(): NavSection[] {
	const docs = listDocsInSequence();
	const bySlug = (slug: string) => docs.find((d) => d.slug === slug);

	const link = (slug: string, fallback: string): NavLink | null => {
		const d = bySlug(slug);
		if (!d) return null;
		return { href: d.href, label: shortDocLabel(d, fallback), slug: d.slug };
	};

	const pick = (...pairs: [string, string][]) =>
		pairs.map(([s, f]) => link(s, f)).filter((x): x is NavLink => x !== null);

	return [
		{
			title: 'Start here',
			items: pick(
				['guide', 'Documentation hub'],
				['00-overview', 'Overview'],
				['01-getting-started', 'Getting started'],
				['02-install', 'Install'],
				['03-auto-use', 'Auto-use mandate']
			)
		},
		{
			title: 'Orchestration',
			items: pick(
				['orchestration', 'Orchestration hub'],
				['orchestration/runtime', 'Runtime loop'],
				['orchestration/capability-lanes', 'Capability lanes'],
				['DEGRADATION', 'Non-blocking policy']
			)
		},
		{
			title: 'Domain bosses',
			items: pick(
				['bosses', 'Bosses hub'],
				['bosses/design', 'Design'],
				['bosses/code', 'Code'],
				['bosses/agent', 'Agent'],
				['bosses/svelte', 'Svelte'],
				['bosses/creator', 'Creator'],
				['bosses/workflow', 'Workflow'],
				['bosses/meta', 'Meta']
			)
		},
		{
			title: 'Armory',
			items: [
				...pick(
					['armory', 'Armory hub'],
					['armory/skills', 'Skills guide'],
					['armory/agents', 'Agents guide'],
					['armory/commands', 'Commands guide']
				),
				{ href: '/skills', label: 'Browse skills' },
				{ href: '/agents', label: 'Browse agents' },
				{ href: '/commands', label: 'Browse commands' }
			]
		},
		{
			title: 'Knowledge',
			items: pick(
				['wiki', 'Wiki hub'],
				['wiki/setup', 'Setup'],
				['wiki/operations', 'Operations'],
				['wiki/schema', 'Schema & frontmatter']
			)
		},
		{
			title: 'Optional systems',
			items: pick(['hooks', 'Hooks'], ['self-improvement', 'Self-improvement'])
		},
		{
			title: 'Reference',
			items: pick(
				['troubleshooting', 'Troubleshooting'],
				['glossary', 'Glossary'],
				['scripts', 'Scripts'],
				['doc-ownership', 'Doc ownership'],
				['soul', 'SOUL.md principles'],
				['agents', 'AGENTS.md router'],
				['customize', 'Customize'],
				['readme', 'Plugin README'],
				['integration-snippet', 'AGENTS snippet']
			)
		}
	];
}

function shortDocLabel(d: CatalogEntry, fallback: string): string {
	// Prefer short titles without " — " suffix for sidebar density
	const t = d.title.split('—')[0]?.trim() || d.title;
	if (t.length > 36) return fallback;
	// Drop leading numeric prefixes for cleaner nav
	return t.replace(/^\d+[.\s-]+/, '') || fallback;
}
