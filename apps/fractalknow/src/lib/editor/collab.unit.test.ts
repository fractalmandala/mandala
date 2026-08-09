import { get } from 'svelte/store';
import { afterEach, describe, expect, it } from 'vitest';
import { documentWorkspace } from '$lib/shell/documents';
import {
	collabState,
	getActiveCollabSession,
	resetCollabState,
	startCollabSession,
	stopCollabSession,
} from './collab';

async function flush(ms = 80): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(condition: () => boolean, timeoutMs = 3000): Promise<void> {
	const start = Date.now();
	while (!condition()) {
		if (Date.now() - start > timeoutMs) return;
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
}

describe('collaboration provider lifecycle', () => {
	afterEach(async () => {
		await resetCollabState();
	});

	it('starts an offline session and tracks status', async () => {
		const session = await startCollabSession('/content/Welcome.md', null);
		expect(session.doc).toBeTruthy();
		expect(session.provider).toBeNull();
		expect(get(collabState).status).toBe('offline');
		expect(get(collabState).documentPath).toBe('/content/Welcome.md');

		const again = await startCollabSession('/content/Welcome.md', null);
		expect(again).toBe(session);

		await stopCollabSession('/content/Welcome.md');
		expect(get(collabState).status).toBe('idle');
	});

	it('mirrors Y.Doc updates into the document store without a mounted editor', async () => {
		const path = '/content/Welcome.md';
		const before = get(documentWorkspace).documents.find((entry) => entry.path === path);
		expect(before?.content).not.toContain('Remote hello');

		const session = await startCollabSession(path, null);
		const Y = await import('yjs');
		const paragraph = new Y.XmlElement('paragraph');
		paragraph.insert(0, [new Y.XmlText('Remote hello')]);
		session.doc.transact(() => {
			session.doc.getXmlFragment(session.fragmentName).insert(0, [paragraph]);
		}, 'remote');

		await waitFor(() =>
			get(documentWorkspace).documents.some((entry) => entry.content.includes('Remote hello')),
		);

		const after = get(documentWorkspace).documents.find((entry) => entry.path === path);
		expect(after?.content).toContain('Remote hello');
		expect(after?.syncState).toBe('dirty');
	});

	it('stops the per-path session when its document tab closes', async () => {
		const path = '/content/Welcome.md';
		const original = get(documentWorkspace);
		documentWorkspace.update((workspace) => ({
			...workspace,
			openPaths: [...workspace.openPaths, path],
			activePath: path,
		}));
		try {
			const session = await startCollabSession(path, null);
			expect(getActiveCollabSession(path)).toBe(session);

			// Close the tab: path leaves openPaths.
			documentWorkspace.update((workspace) => ({
				...workspace,
				openPaths: workspace.openPaths.filter((openPath) => openPath !== path),
				activePath: '/migration',
			}));
			await flush(10);

			expect(getActiveCollabSession(path)).toBeNull();
		} finally {
			documentWorkspace.update((workspace) => ({
				...workspace,
				openPaths: original.openPaths,
				activePath: original.activePath,
			}));
		}
	});

	it('keeps sessions for paths that were never opened as tabs', async () => {
		// The tab-close watcher only reaps open→closed transitions; a session
		// for a path that never appeared in openPaths must survive.
		const session = await startCollabSession('/content/Architecture.md', null);
		await flush(10);
		expect(getActiveCollabSession('/content/Architecture.md')).toBe(session);
	});
});
