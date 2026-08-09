import { describe, expect, it } from 'vitest';
import { buildSidebarNodes, documentsForSection, isDocsPath, isSkillPath } from './sidebar-data';
import type { WorkspaceDocument } from './documents';

function doc(path: string, kind: WorkspaceDocument['kind'] = 'doc'): WorkspaceDocument {
	return {
		kind,
		path,
		title: path.split('/').at(-1) ?? path,
		content: '',
		versions: [],
	};
}

describe('project-backed sidebar data', () => {
	it('classifies skill and docs paths', () => {
		expect(isSkillPath('/.ok/skills/example/SKILL.md')).toBe(true);
		expect(isDocsPath('/content/Welcome.md')).toBe(true);
		expect(isDocsPath('/.ok/skills/example/SKILL.md')).toBe(false);
	});

	it('filters documents by sidebar section', () => {
		const documents = [
			doc('/content/Welcome.md'),
			doc('/.ok/skills/example/SKILL.md'),
			doc('/assets/hero.webp', 'asset'),
		];
		expect(documentsForSection(documents, 'skills').map((item) => item.path)).toEqual([
			'/.ok/skills/example/SKILL.md',
		]);
		expect(documentsForSection(documents, 'docs').map((item) => item.path)).toContain(
			'/content/Welcome.md',
		);
		expect(buildSidebarNodes(documents).length).toBe(3);
	});
});
