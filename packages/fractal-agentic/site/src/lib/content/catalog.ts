import {
	excerptFromMarkdown,
	humanizeSlug,
	parseFrontmatter,
	renderInlineMarkdown,
	titleFromMarkdown
} from './parse';
import type {
	ArmoryStats,
	BossSummary,
	CatalogEntry,
	CatalogKind,
	CatalogSummary,
	SearchResult
} from './types';

/**
 * Armory lives in the sibling `plugin/` package (marketplace install unit).
 * Paths are relative to this file: site/src/lib/content/ → repo root → plugin/
 * Vite requires *static* string literals for import.meta.glob (no template vars).
 */
const skillFiles = import.meta.glob('../../../../plugin/skills/*/SKILL.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const agentFiles = import.meta.glob('../../../../plugin/agents/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const commandFiles = import.meta.glob('../../../../plugin/commands/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** Agent identity + package entrypoints (always under plugin/, never site-only). */
const coreDocFiles = import.meta.glob(
	[
		'../../../../plugin/AGENTS.md',
		'../../../../plugin/SOUL.md',
		'../../../../plugin/CUSTOMIZE.md',
		'../../../../plugin/README.md',
		'../../../../plugin/TROUBLESHOOTING.md',
		'../../../../plugin/project-integration/AGENTS-SNIPPET.md'
	],
	{
		query: '?raw',
		import: 'default',
		eager: true
	}
) as Record<string, string>;

/**
 * Dual support docs under plugin/docs/ — ship with the plugin; site renders them for humans.
 * Source of truth remains plugin/; do not duplicate agent policy only under site/.
 */
const guideFiles = import.meta.glob('../../../../plugin/docs/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const docFiles = { ...coreDocFiles, ...guideFiles };

function pathSlug(path: string, kind: CatalogKind): string {
	if (kind === 'skill') {
		const m = path.match(/\/skills\/([^/]+)\/SKILL\.md$/);
		return m?.[1] ?? path;
	}
	if (kind === 'agent') {
		const m = path.match(/\/agents\/([^/]+)\.md$/);
		return m?.[1] ?? path;
	}
	if (kind === 'command') {
		const m = path.match(/\/commands\/([^/]+)\.md$/);
		return m?.[1] ?? path;
	}
	return path;
}

/** URL slug for docs: guide, guide/bosses/design, agents, … */
function docSlugFromPath(path: string): string | null {
	if (path.endsWith('/AGENTS.md')) return 'agents';
	if (path.endsWith('/SOUL.md')) return 'soul';
	if (path.endsWith('/CUSTOMIZE.md')) return 'customize';
	if (path.endsWith('/TROUBLESHOOTING.md') && path.includes('/plugin/TROUBLESHOOTING.md'))
		return 'troubleshooting-root';
	if (path.endsWith('/README.md') && path.includes('/plugin/README.md')) return 'readme';
	if (path.endsWith('/AGENTS-SNIPPET.md')) return 'integration-snippet';

	const m = path.match(/\/plugin\/docs\/(.+)\.md$/i);
	if (!m) return null;
	const rel = m[1].replace(/\\/g, '/');
	if (/^INDEX$/i.test(rel)) return 'guide';
	return rel.replace(/\/INDEX$/i, '').replace(/\/index$/i, '');
}

function toEntry(kind: CatalogKind, path: string, raw: string): CatalogEntry | null {
	const slug = pathSlug(path, kind);
	if (kind !== 'doc' && (slug === 'INDEX' || slug.toLowerCase() === 'index')) {
		return null;
	}

	const { data, content } = parseFrontmatter(raw);
	const title =
		data.name?.trim() || data.title?.trim() || titleFromMarkdown(content, humanizeSlug(slug));
	const description =
		data.description?.trim() || excerptFromMarkdown(content) || `${kind}: ${slug}`;

	const href =
		kind === 'skill'
			? `/skills/${slug}`
			: kind === 'agent'
				? `/agents/${slug}`
				: kind === 'command'
					? `/commands/${slug}`
					: `/docs/${slug}`;

	return {
		kind,
		slug,
		title,
		description,
		descriptionHtml: renderInlineMarkdown(description),
		href,
		body: content
	};
}

function collect(kind: CatalogKind, files: Record<string, string>): CatalogEntry[] {
	const entries: CatalogEntry[] = [];
	for (const [path, raw] of Object.entries(files)) {
		const entry = toEntry(kind, path, raw);
		if (entry) entries.push(entry);
	}
	return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

const CORE_DOC_META: Record<string, { title: string; description: string }> = {
	agents: {
		title: 'AGENTS.md — Startup Router',
		description:
			'Precedence, trivial exemption, one-boss selection, stop-reading rules, and handoffs.'
	},
	customize: {
		title: 'CUSTOMIZE.md — Edit & Extend',
		description: 'How to edit, customize, and extend the Fractal Agentic plugin safely.'
	},
	readme: {
		title: 'README — Plugin overview',
		description: 'Plugin overview, install, auto-use, and orchestration notes.'
	},
	'integration-snippet': {
		title: 'Project Integration Snippet',
		description:
			'Copy-paste AGENTS.md mandate so any project auto-detects and uses Fractal Agentic.'
	}
};

/**
 * Nested boss playbooks retain filesystem-relative links for offline plugin readers.
 * The website renderer cannot infer that `bosses/<boss>/INDEX.md` is itself nested,
 * so normalize only those cross-boss links for the published route surface.
 */
function websiteDocBody(path: string, content: string): string {
	const boss = '(design|code|agent|svelte|creator|workflow|meta)';
	return content
		.replace(
			new RegExp(`\\]\\((?:\\.\\/)?docs\\/bosses\\/${boss}\\/INDEX\\.md(#[^)]+)?\\)`, 'g'),
			(_match, id: string, hash = '') => `](/docs/bosses/${id}${hash})`
		)
		.replace(
			new RegExp(`\\]\\(\\.\\.\\/${boss}\\/INDEX\\.md(#[^)]+)?\\)`, 'g'),
			(_match, id: string, hash = '') => `](/docs/bosses/${id}${hash})`
		);
}

function collectDocs(): CatalogEntry[] {
	const entries: CatalogEntry[] = [];
	for (const [path, raw] of Object.entries(docFiles)) {
		const slug = docSlugFromPath(path);
		if (!slug) continue;

		const { data, content } = parseFrontmatter(raw);
		const core = CORE_DOC_META[slug];
		const title =
			core?.title ||
			data.title?.trim() ||
			titleFromMarkdown(content, humanizeSlug(slug.split('/').pop() || slug));
		const description =
			core?.description ||
			data.description?.trim() ||
			excerptFromMarkdown(content) ||
			`Guide: ${slug}`;

		entries.push({
			kind: 'doc',
			slug,
			title,
			description,
			descriptionHtml: renderInlineMarkdown(description),
			href: `/docs/${slug}`,
			body: websiteDocBody(path, content)
		});
	}
	// Alphabetical by slug; reading order for prev/next is DOCS_SEQUENCE in nav.ts
	return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

let _skills: CatalogEntry[] | null = null;
let _agents: CatalogEntry[] | null = null;
let _commands: CatalogEntry[] | null = null;
let _docs: CatalogEntry[] | null = null;

export function listSkills(): CatalogEntry[] {
	return (_skills ??= collect('skill', skillFiles));
}

export function listAgents(): CatalogEntry[] {
	return (_agents ??= collect('agent', agentFiles));
}

export function listCommands(): CatalogEntry[] {
	return (_commands ??= collect('command', commandFiles));
}

export function listDocs(): CatalogEntry[] {
	return (_docs ??= collectDocs());
}

export function getSkill(slug: string): CatalogEntry | undefined {
	return listSkills().find((e) => e.slug === slug);
}

export function getAgent(slug: string): CatalogEntry | undefined {
	return listAgents().find((e) => e.slug === slug);
}

export function getCommand(slug: string): CatalogEntry | undefined {
	return listCommands().find((e) => e.slug === slug);
}

export function getDoc(slug: string): CatalogEntry | undefined {
	return listDocs().find((e) => e.slug === slug);
}

export function toSummaries(entries: CatalogEntry[]): CatalogSummary[] {
	return entries.map(({ kind, slug, title, description, descriptionHtml, href }) => ({
		kind,
		slug,
		title,
		description,
		descriptionHtml,
		href
	}));
}

export function getArmoryStats(): ArmoryStats {
	return {
		skills: listSkills().length,
		agents: listAgents().length,
		commands: listCommands().length,
		bosses: listBosses().length,
		orchestrators: 1
	};
}

/** Executive boss summaries aligned with the nested boss playbooks. */
export function listBosses(): BossSummary[] {
	return [
		{
			id: 'design',
			name: 'Design Boss',
			mission: 'Design systems, UI craft, accessibility, motion, and visual QA — Svelte UI first.',
			href: '/docs/bosses/design'
		},
		{
			id: 'code',
			name: 'Code Boss',
			mission:
				'Audits, security, performance, tech debt, tests, and documentation generated from code.',
			href: '/docs/bosses/code'
		},
		{
			id: 'agent',
			name: 'Agent Boss',
			mission:
				'Product agent OS: harnesses, memory, eval, multi-agent orchestration, MCP tool servers.',
			href: '/docs/bosses/agent'
		},
		{
			id: 'svelte',
			name: 'Svelte Boss',
			mission:
				'Svelte 5 runes, SvelteKit data flow, indented SASS, and the shadcn → fractalsvelte port lane.',
			href: '/docs/bosses/svelte'
		},
		{
			id: 'creator',
			name: 'Creator Boss',
			mission:
				'Scaffold → build → ship for apps, sites, and packages. Executive right over other boss armories.',
			href: '/docs/bosses/creator'
		},
		{
			id: 'workflow',
			name: 'Workflow Boss',
			mission:
				'Personal OS: session habits, instincts, hooks, cost, loops — not product agent frameworks.',
			href: '/docs/bosses/workflow'
		},
		{
			id: 'meta',
			name: 'Meta Boss',
			mission: 'ECC install, skill inventory, compliance, promotions, and portfolio pruning.',
			href: '/docs/bosses/meta'
		}
	];
}

/** One searchable index for the global site search. */
export function getSearchIndex(): SearchResult[] {
	const catalogResults: SearchResult[] = [
		...listSkills(),
		...listAgents(),
		...listCommands(),
		...listDocs()
	].map(({ kind, slug, title, description, href }) => ({
		kind,
		slug,
		title,
		description,
		href
	}));

	const bossResults: SearchResult[] = listBosses().map(({ id, name, mission, href }) => ({
		kind: 'boss',
		slug: id,
		title: name,
		description: mission,
		href
	}));

	return [...catalogResults, ...bossResults].sort((a, b) =>
		a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
	);
}
