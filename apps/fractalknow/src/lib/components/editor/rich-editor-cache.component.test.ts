import { render, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';
import type { Editor } from '@tiptap/core';
import RichEditor from './RichEditor.svelte';

/**
 * Regression tests for the editorCache lifecycle bug flagged in Wave 2a:
 * a cached per-document TipTap editor stays bound to its Collaboration Y.Doc.
 * When the collab session is reaped (tab closed → stopCollabSession destroys
 * the Y.Doc), reopening that document must NOT reuse the stale cached editor.
 */

type MockSession = { doc: InstanceType<typeof import('yjs').Doc>; provider: null; fragmentName: string };

const collabMock = vi.hoisted(() => {
	const sessions = new Map<string, MockSession>();
	const startCalls: string[] = [];
	return { sessions, startCalls };
});

vi.mock('$lib/editor/collab', () => ({
	startCollabSession: vi.fn(async (path: string) => {
		collabMock.startCalls.push(path);
		let session = collabMock.sessions.get(path);
		if (!session) {
			const { Doc } = await import('yjs');
			session = { doc: new Doc(), provider: null, fragmentName: 'default' };
			collabMock.sessions.set(path, session);
		}
		return session;
	}),
	stopCollabSession: vi.fn(async (path?: string | null) => {
		if (path == null) {
			for (const session of collabMock.sessions.values()) session.doc.destroy();
			collabMock.sessions.clear();
			return;
		}
		const session = collabMock.sessions.get(path);
		if (session) {
			session.doc.destroy();
			collabMock.sessions.delete(path);
		}
	}),
	getActiveCollabSession: (path: string) => collabMock.sessions.get(path) ?? null,
	getCollabUser: () => ({ name: 'Test User', color: '#000000' }),
}));

vi.mock('$lib/shell', () => ({
	resetRichEditorStatus: vi.fn(),
	setRichEditorStatus: vi.fn(),
	updateDocumentViewState: vi.fn(),
	richEditorStatus: writable({
		heading: false,
		bold: false,
		italic: false,
		strike: false,
		code: false,
		link: false,
		bulletList: false,
		orderedList: false,
		blockquote: false,
		codeBlock: false,
		selectionEmpty: true,
		characterCount: 0,
		canUndo: false,
		canRedo: false,
	}),
	appConfig: writable({
		syncCollaboration: { serverUrl: 'ws://collab.test', collaborationEnabled: true },
		project: { collabUrl: '' },
	}),
}));

type DocFixture = { path: string; content: string; viewState: null };

function doc(path: string, content: string): DocFixture {
	return { path, content, viewState: null };
}

function startsFor(path: string): number {
	return collabMock.startCalls.filter((call) => call === path).length;
}

/** Let async build continuations (cache writes) settle after DOM is visible. */
function settle(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 100));
}

describe('RichEditor editorCache lifecycle', () => {
	beforeEach(() => {
		collabMock.sessions.clear();
		collabMock.startCalls.length = 0;
	});

	it('reuses the cached editor while its collab session is still alive', async () => {
		const onUpdate = vi.fn();
		const { rerender, container } = render(RichEditor, {
			document: doc('a.md', '# Alpha'),
			onUpdate,
		} as never);
		await waitFor(() => expect(container.querySelector('.tiptap')).toBeTruthy());
		await waitFor(() => expect(startsFor('a.md')).toBe(1));

		await rerender({ document: doc('b.md', '# Bravo'), onUpdate } as never);
		await waitFor(() => expect(startsFor('b.md')).toBe(1));

		// Session for a.md untouched — switching back must reuse the cache.
		await rerender({ document: doc('a.md', '# Alpha'), onUpdate } as never);
		await waitFor(() => expect(container.querySelector('.tiptap')?.textContent).toContain('Alpha'));
		expect(startsFor('a.md')).toBe(1);
	});

	it('rebuilds the editor when its collab session was reaped while switched away', async () => {
		const onUpdate = vi.fn();
		const { rerender, container } = render(RichEditor, {
			document: doc('a.md', '# Alpha'),
			onUpdate,
		} as never);
		// Wait for the build to fully complete so the cache entry exists.
		await waitFor(() => expect(container.querySelector('.tiptap')?.textContent).toContain('Alpha'));
		await settle();
		expect(startsFor('a.md')).toBe(1);

		await rerender({ document: doc('b.md', '# Bravo'), onUpdate } as never);
		await waitFor(() => expect(container.querySelector('.tiptap')?.textContent).toContain('Bravo'));
		await settle();

		// Tab for a.md closes → collab.ts reaps the session, destroying the Y.Doc
		// that the cached a.md editor is still bound to.
		const { stopCollabSession } = await import('$lib/editor/collab');
		await stopCollabSession('a.md');

		// Reopening a.md must build a fresh editor against a fresh session —
		// reusing the cached editor would bind to the destroyed Y.Doc.
		await rerender({ document: doc('a.md', '# Alpha'), onUpdate } as never);
		await waitFor(() => expect(startsFor('a.md')).toBe(2));
		await waitFor(() => expect(container.querySelector('.tiptap')?.textContent).toContain('Alpha'));
	});

	it('destroys an editor whose async build finishes after the component unmounts', async () => {
		const core = await import('@tiptap/core');
		const destroySpy = vi.spyOn(core.Editor.prototype, 'destroy');
		try {
			const onUpdate = vi.fn();
			const view = render(RichEditor, {
				document: doc('slow.md', '# Slow'),
				onUpdate,
			} as never);
			// Unmount while buildEditorForPath is still awaiting its dynamic imports.
			view.unmount();
			// Let the pending build resolve.
			await waitFor(() => expect(startsFor('slow.md')).toBeGreaterThan(0));
			await new Promise((resolve) => setTimeout(resolve, 50));
			const destroyed: Editor[] = destroySpy.mock.instances as Editor[];
			expect(destroySpy).toHaveBeenCalled();
			expect(destroyed.length).toBeGreaterThan(0);
		} finally {
			destroySpy.mockRestore();
		}
	});
});
