import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { documentWorkspace } from './documents';
import { projectState } from './projects';
import { navigateToDeepLink, shellState } from './store';

function resetState(): void {
	documentWorkspace.set({
		documents: [
			{
				kind: 'migration',
				path: '/migration',
				title: 'Migration Plan',
				content: '',
				versions: [],
			},
		],
		openPaths: ['/migration'],
		activePath: '/migration',
		pendingTarget: null,
		notice: null,
	});
	shellState.set({
		sidebarOpen: true,
		commandPaletteOpen: false,
		activeDialog: 'none',
		activePanel: 'migration',
		activeTarget: { kind: 'migration', path: '/migration', title: 'Migration Plan' },
		editorMode: 'rich',
		terminalOpen: false,
		searchQuery: '',
		rightPanelOpen: false,
		rightPanelView: 'activity',
		rightPanelWidth: 352,
	});
	projectState.set({
		path: '',
		name: 'fractalknow',
		source: 'browser-preview',
		openedAt: null,
		notice: null,
	});
}

describe('deep-link navigation', () => {
	beforeEach(resetState);

	it('navigates into a document target from a deep link', () => {
		expect(navigateToDeepLink('fractalknow://open?doc=/content/Welcome.md')).toBe(true);

		expect(get(shellState).activeTarget.path).toBe('/content/Welcome.md');
		expect(get(projectState).path).toBe('');
	});

	it('switches project before navigating into a project document', () => {
		expect(
			navigateToDeepLink('fractalknow://open?project=/tmp/demo&doc=/content/Brief.md'),
		).toBe(true);

		const project = get(projectState);
		expect(project.path).toBe('/tmp/demo');
		expect(project.name).toBe('demo');
		expect(project.source).toBe('folder-picker');
		expect(get(shellState).activeTarget.path).toBe('/content/Brief.md');
		expect(get(shellState).activePanel).toBe('editor');
	});

	it('opens a project-only deep link without changing the document target', () => {
		expect(navigateToDeepLink('fractalknow://open?project=/tmp/empty-project')).toBe(true);

		expect(get(projectState).path).toBe('/tmp/empty-project');
		expect(get(shellState).activeTarget.path).toBe('/migration');
	});

	it('supports /project/<path> style deep links', () => {
		expect(
			navigateToDeepLink('fractalknow://host/project/tmp/alpha?doc=/docs/Plan.md'),
		).toBe(true);

		expect(get(projectState).path).toBe('/tmp/alpha');
		expect(get(shellState).activeTarget.path).toBe('/docs/Plan.md');
	});

	it('navigates hash routes and rejects unusable deep links', () => {
		expect(navigateToDeepLink('fractalknow://open#/document?path=/content/Hash.md&kind=doc')).toBe(
			true,
		);
		expect(get(shellState).activeTarget.path).toBe('/content/Hash.md');

		expect(navigateToDeepLink('fractalknow://open/')).toBe(false);
		expect(navigateToDeepLink('')).toBe(false);
	});
});
