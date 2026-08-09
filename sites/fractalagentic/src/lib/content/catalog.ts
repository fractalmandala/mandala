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
 * Armory lives in the `packages/fractal-agentic` package (the marketplace install
 * unit is that package root — no nested `plugin/` dir). Paths are relative to this
 * file: sites/fractalagentic/src/lib/content/ → repo root → packages/fractal-agentic.
 * Vite requires *static* string literals for import.meta.glob (no template vars).
 */
const skillFiles = import.meta.glob('../../../../../packages/fractal-agentic/skills/*/SKILL.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const agentFiles = import.meta.glob('../../../../../packages/fractal-agentic/agents/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const commandFiles = import.meta.glob('../../../../../packages/fractal-agentic/commands/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const bossFiles = import.meta.glob('../../../../../packages/fractal-agentic/bosses/*/INDEX.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** Agent identity + package entrypoints (package root files, never site-only). */
const coreDocFiles = import.meta.glob(
	[
		'../../../../../packages/fractal-agentic/AGENTS.md',
		'../../../../../packages/fractal-agentic/SOUL.md',
		'../../../../../packages/fractal-agentic/CUSTOMIZE.md',
		'../../../../../packages/fractal-agentic/README.md',
		'../../../../../packages/fractal-agentic/TROUBLESHOOTING.md',
		'../../../../../packages/fractal-agentic/project-integration/AGENTS-SNIPPET.md'
	],
	{
		query: '?raw',
		import: 'default',
		eager: true
	}
) as Record<string, string>;

/**
 * Dual support docs under packages/fractal-agentic/docs/ — ship with the package;
 * site renders them for humans. Source of truth remains the package; do not
 * duplicate agent policy only under the site.
 */
const guideFiles = import.meta.glob('../../../../../packages/fractal-agentic/docs/**/*.md', {
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
	if (kind === 'bosses') {
		const m = path.match(/\/bosses\/([^/]+)\/INDEX\.md$/);
		return m?.[1] ?? path;
	}
	return path;
}

/** URL slug for docs: guide, guide/bosses/design, agents, … */
function docSlugFromPath(path: string): string | null {
	if (path.endsWith('/AGENTS.md')) return 'agents';
	if (path.endsWith('/SOUL.md')) return 'soul';
	if (path.endsWith('/CUSTOMIZE.md')) return 'customize';
	if (path.endsWith('/TROUBLESHOOTING.md')) return 'troubleshooting-root';
	if (path.endsWith('/README.md')) return 'readme';
	if (path.endsWith('/AGENTS-SNIPPET.md')) return 'integration-snippet';

	const m = path.match(/\/docs\/(.+)\.md$/i);
	if (!m) return null;
	const rel = m[1].replace(/\\/g, '/');
	if (/^INDEX$/i.test(rel)) return 'guide';
	// Lowercased so URL slugs are case-insensitive-safe (DEGRADATION.md → degradation)
	return rel
		.replace(/\/INDEX$/i, '')
		.replace(/\/index$/i, '')
		.toLowerCase();
}

function toEntry(kind: CatalogKind, path: string, raw: string): CatalogEntry | null {
	const slug = pathSlug(path, kind);
	if (kind !== 'doc' && (slug === 'INDEX' || slug.toLowerCase() === 'index')) {
		return null;
	}

	const { data, content } = parseFrontmatter(raw);
	// Skills/agents/commands are identified by a kebab-case slug (the file or
	// folder name). Show a humanized, capitalized display title everywhere
	// (sidebar, cards, page <h1>, search) instead of the raw hyphenated id.
	// Bosses and docs keep their authored frontmatter title.
	const title =
		kind === 'skill' || kind === 'agent' || kind === 'command'
			? humanizeSlug(slug)
			: data.name?.trim() || data.title?.trim() || titleFromMarkdown(content, humanizeSlug(slug));
	const description =
		data.description?.trim() || excerptFromMarkdown(content) || `${kind}: ${slug}`;

	const href =
		kind === 'skill'
			? `/skills/${slug}`
			: kind === 'agent'
				? `/agents/${slug}`
				: kind === 'command'
					? `/commands/${slug}`
					: kind === 'bosses'
						? `/bosses/${slug}`
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
			(_match, id: string, hash = '') => `](/bosses/${id}${hash})`
		)
		.replace(
			new RegExp(`\\]\\(\\.\\.\\/${boss}\\/INDEX\\.md(#[^)]+)?\\)`, 'g'),
			(_match, id: string, hash = '') => `](/bosses/${id}${hash})`
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
			body: websiteDocBody(path, content),
			sourcePath: path.substring(path.indexOf('packages/fractal-agentic'))
		});
	}
	// Alphabetical by slug; reading order for prev/next is DOCS_SEQUENCE in nav.ts
	return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

let _skills: CatalogEntry[] | null = null;
let _agents: CatalogEntry[] | null = null;
let _commands: CatalogEntry[] | null = null;
let _bossEntries: CatalogEntry[] | null = null;
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

export function listBossEntries(): CatalogEntry[] {
	return (_bossEntries ??= collect('bosses', bossFiles));
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

export function getBossEntry(slug: string): CatalogEntry | undefined {
	return listBossEntries().find((e) => e.slug === slug);
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

/** Executive boss summaries aligned with the nested boss playbooks and published routes. */
export function listBosses(): BossSummary[] {
	return listBossEntries().map((entry) => ({
		id: entry.slug,
		name: entry.title,
		mission: entry.description,
		href: entry.href
	}));
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

/** Playbook workflows shipped with the plugin (`workflows/*.workflow.md`). */
const workflowFiles = import.meta.glob(
	'../../../../../packages/fractal-agentic/workflows/*.workflow.md',
	{ query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

const hooksProfilesFile = import.meta.glob(
	'../../../../../packages/fractal-agentic/hooks/profiles.json',
	{ query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

const hooksReadmeFile = import.meta.glob(
	'../../../../../packages/fractal-agentic/hooks/README.md',
	{ query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

const cliReadmeFile = import.meta.glob('../../../../../packages/fractal-agentic/bin/README.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const pluginJsonFile = import.meta.glob('../../../../../packages/fractal-agentic/plugin.json', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** Non-eager: skill folder file trees for detail pages without bundling contents. */
const skillTreeKeys = Object.keys(
	import.meta.glob('../../../../../packages/fractal-agentic/skills/**')
);

export interface WorkflowEntry {
	slug: string;
	title: string;
	description: string;
	href: string;
	/** Markdown body without frontmatter */
	body: string;
}

export interface HooksProfiles {
	default: string;
	profiles: Record<string, string[]>;
}

export interface CliSection {
	heading: string;
	body: string;
}

let _workflows: WorkflowEntry[] | null = null;

export function listWorkflows(): WorkflowEntry[] {
	if (_workflows) return _workflows;
	const entries: WorkflowEntry[] = [];
	for (const [path, raw] of Object.entries(workflowFiles)) {
		const slug = path.match(/\/workflows\/([^/]+)\.workflow\.md$/)?.[1];
		if (!slug) continue;
		const { data, content } = parseFrontmatter(raw);
		entries.push({
			slug,
			title: data.title?.trim() || titleFromMarkdown(content, humanizeSlug(slug)),
			description: data.description?.trim() || excerptFromMarkdown(content) || `Workflow: ${slug}`,
			href: `/workflows/${slug}`,
			body: content
		});
	}
	return (_workflows = entries.sort((a, b) => a.slug.localeCompare(b.slug)));
}

export function getWorkflow(slug: string): WorkflowEntry | undefined {
	return listWorkflows().find((w) => w.slug === slug);
}

/** Guard-hook profiles from hooks/profiles.json (minimal / standard / strict). */
export function getHooksProfiles(): HooksProfiles | null {
	const raw = Object.values(hooksProfilesFile)[0];
	if (!raw) return null;
	try {
		return JSON.parse(raw) as HooksProfiles;
	} catch {
		return null;
	}
}

/** bin/README.md split on `## ` headings so the CLI page renders verb groups. */
export function getCliSections(): CliSection[] {
	const raw = Object.values(cliReadmeFile)[0] ?? '';
	return raw
		.split(/^## /m)
		.slice(1)
		.map((chunk) => {
			const newline = chunk.indexOf('\n');
			const heading = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
			const body = newline === -1 ? '' : chunk.slice(newline + 1).trim();
			return { heading, body };
		});
}

/** Plugin version from plugin.json — shown in hero stats instead of stale copy. */
export function getPackageVersion(): string {
	const raw = Object.values(pluginJsonFile)[0];
	if (!raw) return '';
	try {
		return (JSON.parse(raw) as { version?: string }).version ?? '';
	} catch {
		return '';
	}
}

/** Files shipped under a skill folder (SKILL.md excluded — it renders as the body). */
export function getSkillFiles(slug: string): string[] {
	const marker = `/skills/${slug}/`;
	return skillTreeKeys
		.filter((path) => path.includes(marker))
		.map((path) => path.slice(path.indexOf(marker) + marker.length))
		.filter((rel) => rel && rel !== 'SKILL.md')
		.sort((a, b) => a.localeCompare(b));
}

/** hooks/README.md raw body — rendered on the /hooks page. */
export function getHooksReadme(): string {
	return Object.values(hooksReadmeFile)[0] ?? '';
}
