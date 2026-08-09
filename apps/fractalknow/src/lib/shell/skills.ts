import { derived, get, writable } from 'svelte/store';
import { workspaceDocuments, type WorkspaceDocument } from './documents';
import { getFilesBridge, type BundleSyncReport } from '$lib/editor/project-files';
import { logLocalActivity } from './agent-sessions';

/**
 * Bundled skills/agents/commands pipeline (T045a) + skills settings model.
 *
 * The app ships a curated bundle (`bundled/` at the repo root — the
 * investigation's skill set: agentic / curated-curor / fractal-agentic skills,
 * plus boss agents and commands). On project open the Tauri command
 * `sync_bundled_skills` materializes it into the project at
 * `.ok/skills/bundled/…`, `.ok/agents/bundled/…`, `.ok/commands/bundled/…`
 * (idempotent via a versioned marker). From there the ordinary document
 * pipeline surfaces the skills in the sidebar skills section, and
 * `syncSkillsPipeline` exposes them to the settings Skills section.
 */

// ---------------------------------------------------------------------------
// Bundle sync (T045a core)
// ---------------------------------------------------------------------------

export type BundleSyncState = {
	state: 'idle' | 'syncing' | 'synced' | 'error';
	report: BundleSyncReport | null;
	error: string | null;
};

export const bundleSyncState = writable<BundleSyncState>({
	state: 'idle',
	report: null,
	error: null,
});

type SyncBridge = { syncBundledSkills?: () => Promise<BundleSyncReport> };

/**
 * Run the bundle sync against the active files bridge. Never throws: a
 * missing bridge capability (browser runtime) or a sync failure must not
 * block project open — the error is surfaced in `bundleSyncState` instead.
 */
export async function syncBundledSkillsPipeline(bridge: SyncBridge = getFilesBridge()): Promise<void> {
	if (typeof bridge.syncBundledSkills !== 'function') {
		bundleSyncState.set({ state: 'idle', report: null, error: null });
		return;
	}
	bundleSyncState.set({ state: 'syncing', report: null, error: null });
	try {
		const report = await bridge.syncBundledSkills();
		bundleSyncState.set({ state: 'synced', report, error: null });
		logLocalActivity(
			'command',
			report.skipped
				? `Skills bundle sync skipped (${report.reason ?? 'up to date'})`
				: `Skills bundle synced (${report.filesCopied} files copied)`,
			[],
		);
	} catch (error) {
		bundleSyncState.set({
			state: 'error',
			report: null,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

/** Skills materialized from the app bundle (subset of the sidebar skills section). */
export const bundledSkillDocuments = derived(workspaceDocuments, ($documents) =>
	$documents.filter(
		(document: WorkspaceDocument) =>
			document.kind !== 'folder' && document.path.includes('/.ok/skills/bundled/'),
	),
);

/** Bundled agent definitions (fractal-agentic agents), for future agent surfaces (T045b/T072). */
export const bundledAgentDocuments = derived(workspaceDocuments, ($documents) =>
	$documents.filter(
		(document: WorkspaceDocument) =>
			document.kind !== 'folder' && document.path.includes('/.ok/agents/bundled/'),
	),
);

/** Bundled command definitions (fractal-agentic commands). */
export const bundledCommandDocuments = derived(workspaceDocuments, ($documents) =>
	$documents.filter(
		(document: WorkspaceDocument) =>
			document.kind !== 'folder' && document.path.includes('/.ok/commands/bundled/'),
	),
);

// ---------------------------------------------------------------------------
// Skills settings model (settings Skills section)
// ---------------------------------------------------------------------------

export type SkillScope = 'bundled' | 'project';

export type SkillEntry = {
	id: string;
	name: string;
	description: string;
	scope: SkillScope;
	enabled: boolean;
	path: string;
	metadata?: Record<string, string>;
};

export const BUNDLED_SKILLS: SkillEntry[] = [
	{
		id: 'antigravity-guide',
		name: 'antigravity-guide',
		description: 'Antigravity AI guide and slash command sitemap',
		scope: 'bundled',
		enabled: true,
		path: '/.ok/skills/bundled/agentic/antigravity-guide/SKILL.md',
		metadata: { source: 'agentic', version: '1.0.0' },
	},
];

export const skillsStore = writable<SkillEntry[]>([]);

export type SkillTargetEditor = 'claude' | 'codex' | 'cursor' | 'builtin';
export const skillTargetsStore = writable<Record<SkillTargetEditor, boolean>>({
	claude: true,
	codex: true,
	cursor: true,
	builtin: true,
});

export function toggleSkillTarget(target: SkillTargetEditor, enabled: boolean): void {
	skillTargetsStore.update((current) => ({ ...current, [target]: enabled }));
}

export function toggleSkillEnabled(id: string, enabled: boolean): void {
	skillsStore.update((skills) =>
		skills.map((skill) => (skill.id === id ? { ...skill, enabled } : skill)),
	);
}

/**
 * Map bundle documents (`/.ok/skills/bundled/<source>/<name>/…`) to entries.
 * One entry per skill directory (keyed on the SKILL.md when present).
 */
export function parseBundledSkillsFromDocs(documents: WorkspaceDocument[]): SkillEntry[] {
	const entries: SkillEntry[] = [];
	for (const doc of documents) {
		if (doc.kind === 'folder') continue;
		if (!doc.path.includes('/.ok/skills/bundled/')) continue;
		const parts = doc.path.split('/');
		const skillsIdx = parts.indexOf('skills');
		const source = parts[skillsIdx + 2] ?? 'bundle';
		const name = parts[skillsIdx + 3] ?? doc.title;
		// Only index each skill directory once, via its SKILL.md.
		if (!/(?:^|\/)SKILL\.md$/i.test(doc.path)) continue;
		const id = `bundled:${source}:${name}`;
		if (entries.some((entry) => entry.id === id)) continue;
		entries.push({
			id,
			name,
			description: `Bundled skill from the ${source} collection`,
			scope: 'bundled',
			enabled: true,
			path: doc.path,
			metadata: { source },
		});
	}
	return entries;
}

export function parseProjectSkillsFromDocs(documents: WorkspaceDocument[]): SkillEntry[] {
	const projectSkills: SkillEntry[] = [];
	for (const doc of documents) {
		if (doc.kind === 'folder') continue;
		if (!doc.path.includes('/.ok/skills/') && !/(?:^|\/)SKILL\.md$/i.test(doc.path)) continue;
		if (doc.path.includes('/.ok/skills/bundled/')) continue; // bundled scope handled separately
		const parts = doc.path.split('/');
		const idx = parts.indexOf('skills');
		const skillName = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : doc.title;
		const id = `project:${skillName}`;

		if (!projectSkills.some((s) => s.id === id)) {
			projectSkills.push({
				id,
				name: skillName,
				description: `Project skill at ${doc.path}`,
				scope: 'project',
				enabled: true,
				path: doc.path,
				metadata: { source: 'project-local' },
			});
		}
	}

	return projectSkills;
}

export function syncSkillsPipeline(documents: WorkspaceDocument[]): void {
	const parsedBundled = parseBundledSkillsFromDocs(documents);
	const parsedProject = parseProjectSkillsFromDocs(documents);
	const current = get(skillsStore);

	const currentBundled = current.filter((s) => s.scope === 'bundled');
	const currentProject = current.filter((s) => s.scope === 'project');

	const bundledSkills =
		parsedBundled.length > 0
			? parsedBundled
			: currentBundled.length > 0
				? currentBundled
				: BUNDLED_SKILLS;
	const projectSkills = parsedProject.length > 0 ? parsedProject : currentProject;

	const preserve = (entries: SkillEntry[]) =>
		entries.map((entry) => {
			const existing = current.find((c) => c.id === entry.id);
			return existing ? { ...entry, enabled: existing.enabled } : entry;
		});

	skillsStore.set([...preserve(bundledSkills), ...preserve(projectSkills)]);
}
