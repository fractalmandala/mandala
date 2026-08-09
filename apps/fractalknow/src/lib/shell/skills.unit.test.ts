import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	bundleSyncState,
	bundledAgentDocuments,
	bundledCommandDocuments,
	bundledSkillDocuments,
	parseBundledSkillsFromDocs,
	parseProjectSkillsFromDocs,
	skillsStore,
	skillTargetsStore,
	syncBundledSkillsPipeline,
	syncSkillsPipeline,
	toggleSkillEnabled,
	toggleSkillTarget,
} from './skills';
import { documentWorkspace } from './documents';

function doc(path: string, kind: 'doc' | 'folder' = 'doc') {
	return {
		kind,
		path,
		title: path.split('/').pop() ?? path,
		content: '',
		versions: [],
		lastSavedContent: '',
		loadState: 'loaded' as const,
		syncState: 'saved' as const,
		loadError: null,
	};
}

function setDocuments(documents: ReturnType<typeof doc>[]): void {
	documentWorkspace.set({
		documents,
		openPaths: [],
		activePath: null,
		pendingTarget: null,
		viewStates: {},
	} as never);
}

describe('bundle sync pipeline (T045a)', () => {
	beforeEach(() => {
		bundleSyncState.set({ state: 'idle', report: null, error: null });
	});

	it('stays idle when the bridge has no bundle capability (browser runtime)', async () => {
		await syncBundledSkillsPipeline({});
		expect(get(bundleSyncState).state).toBe('idle');
	});

	it('transitions to synced with the report on success', async () => {
		const report = { version: 1, filesCopied: 42, skipped: false, reason: null };
		const syncBundledSkills = vi.fn().mockResolvedValue(report);
		await syncBundledSkillsPipeline({ syncBundledSkills });
		expect(syncBundledSkills).toHaveBeenCalledOnce();
		expect(get(bundleSyncState)).toEqual({ state: 'synced', report, error: null });
	});

	it('captures failures without throwing (project open must not break)', async () => {
		const syncBundledSkills = vi.fn().mockRejectedValue(new Error('disk full'));
		await expect(syncBundledSkillsPipeline({ syncBundledSkills })).resolves.toBeUndefined();
		expect(get(bundleSyncState).state).toBe('error');
		expect(get(bundleSyncState).error).toBe('disk full');
	});

	it('derives bundled skills/agents/commands from workspace documents', () => {
		setDocuments([
			doc('/.ok/skills/bundled/agentic/demo/SKILL.md'),
			doc('/.ok/skills/bundled', 'folder'),
			doc('/.ok/skills/notes/OWN-SKILL.md'),
			doc('/.ok/agents/bundled/reviewer.md'),
			doc('/.ok/commands/bundled/review.md'),
			doc('/content/Welcome.md'),
		]);
		expect(get(bundledSkillDocuments).map((d) => d.path)).toEqual([
			'/.ok/skills/bundled/agentic/demo/SKILL.md',
		]);
		expect(get(bundledAgentDocuments).map((d) => d.path)).toEqual(['/.ok/agents/bundled/reviewer.md']);
		expect(get(bundledCommandDocuments).map((d) => d.path)).toEqual(['/.ok/commands/bundled/review.md']);
	});
});

describe('skills settings model', () => {
	beforeEach(() => {
		skillsStore.set([]);
		skillTargetsStore.set({ claude: true, codex: true, cursor: true, builtin: true });
	});

	it('parses bundled skills from bundle documents, one entry per SKILL.md, namespaced by source', () => {
		const parsed = parseBundledSkillsFromDocs([
			doc('/.ok/skills/bundled/agentic/demo/SKILL.md'),
			doc('/.ok/skills/bundled/agentic/demo/helper.py'),
			doc('/.ok/skills/bundled/bosses/demo/SKILL.md'),
			doc('/.ok/skills/project-local/SKILL.md'),
		] as never);
		expect(parsed.map((s) => s.id)).toEqual(['bundled:agentic:demo', 'bundled:bosses:demo']);
		expect(parsed.every((s) => s.scope === 'bundled')).toBe(true);
	});

	it('parses project skills from workspace documents, excluding the bundle scope', () => {
		const parsed = parseProjectSkillsFromDocs([
			doc('/content/Doc.md'),
			doc('/.ok/skills/custom-workflow/SKILL.md'),
			doc('/.ok/skills/bundled/agentic/demo/SKILL.md'),
		] as never);
		expect(parsed).toHaveLength(1);
		expect(parsed[0].id).toBe('project:custom-workflow');
		expect(parsed[0].scope).toBe('project');
	});

	it('syncs the pipeline from documents and preserves enabled toggles across re-syncs', () => {
		const docs = [
			doc('/.ok/skills/bundled/agentic/demo/SKILL.md'),
			doc('/.ok/skills/custom-workflow/SKILL.md'),
		];
		syncSkillsPipeline(docs as never);
		expect(get(skillsStore).map((s) => s.id)).toEqual([
			'bundled:agentic:demo',
			'project:custom-workflow',
		]);

		toggleSkillEnabled('bundled:agentic:demo', false);
		syncSkillsPipeline(docs as never);
		const current = get(skillsStore);
		expect(current.find((s) => s.id === 'bundled:agentic:demo')?.enabled).toBe(false);
		expect(current.find((s) => s.id === 'project:custom-workflow')?.enabled).toBe(true);

		toggleSkillTarget('claude', false);
		expect(get(skillTargetsStore).claude).toBe(false);
	});
});
