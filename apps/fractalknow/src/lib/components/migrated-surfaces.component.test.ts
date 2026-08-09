import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import AppShell from './AppShell.svelte';
import CommandPalette from './CommandPalette.svelte';
import DialogHost from './DialogHost.svelte';
import EditorSurface from './EditorSurface.svelte';
import ShellSidebar from './ShellSidebar.svelte';
import { tick } from 'svelte';
import {
	defaultPreferences,
	documentWorkspace,
	projectState,
	recentProjects,
	shellPreferences,
	shellState,
} from '$lib/shell';
import type { DocumentMetadata, DocumentVersion, WorkspaceDocument } from '$lib/shell/documents';

function metadata(path: string, content: string): DocumentMetadata {
	const extension = path.split('.').at(-1) ?? '';
	return {
		size: content.length,
		extension,
		mime: extension === 'md' ? 'text/markdown' : 'text/plain',
		binary: false,
		large: false,
		updatedAt: '2026-07-30T00:00:00.000Z',
	};
}

function documentFixture(
	document: Pick<WorkspaceDocument, 'kind' | 'path' | 'title' | 'content'> & {
		versions?: DocumentVersion[];
	},
): WorkspaceDocument {
	return {
		...document,
		versions: document.versions ?? [],
		lastSavedContent: document.content,
		loadState: 'loaded',
		syncState: 'saved',
		loadError: null,
		metadata: metadata(document.path, document.content),
	};
}

function resetStores(): void {
	shellPreferences.set(defaultPreferences);
	shellState.set({
		sidebarOpen: true,
		commandPaletteOpen: false,
		activeDialog: 'none',
		activePanel: 'migration',
		activeTarget: {
			kind: 'migration',
			path: '/migration',
			title: 'Migration Plan',
		},
		editorMode: 'rich',
		terminalOpen: false,
		searchQuery: '',
		rightPanelOpen: false,
		rightPanelView: 'activity',
		rightPanelWidth: 352,
	});
	documentWorkspace.set({
		documents: [
			documentFixture({
				kind: 'migration',
				path: '/migration',
				title: 'Migration Plan',
				content: 'Task-wise Tauri + SvelteKit migration plan.',
			}),
			documentFixture({
				kind: 'doc',
				path: '/content/Welcome.md',
				title: 'Welcome.md',
				content: '# Welcome',
			}),
			documentFixture({
				kind: 'asset',
				path: '/assets/hero.webp',
				title: 'hero.webp',
				content: 'Asset preview placeholder.',
			}),
		],
		openPaths: ['/migration'],
		activePath: '/migration',
		pendingTarget: null,
		notice: null,
	});
	projectState.set({
		path: '',
		name: 'fractalknow',
		source: 'browser-preview',
		openedAt: null,
		notice: null,
	});
	recentProjects.set([]);
}

describe('migrated Svelte surfaces', () => {
	beforeEach(resetStores);

	it('renders the app shell with sidebar, toolbar, migration surface, and bridge footer', async () => {
		render(AppShell);

		expect(screen.getByLabelText('Workspace files')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Migration Plan' })).toBeInTheDocument();
		expect(screen.getByLabelText('Editor surface')).toHaveTextContent('Task Plan And Port Status');
		await waitFor(() => expect(screen.getByText(/bridge connected/i)).toBeInTheDocument());
	});

	it('renders shell empty state when the editor has no workspace documents', async () => {
		documentWorkspace.set({
			documents: [
				documentFixture({
					kind: 'migration',
					path: '/migration',
					title: 'Migration Plan',
					content: 'Task-wise Tauri + SvelteKit migration plan.',
				}),
			],
			openPaths: ['/migration'],
			activePath: '/migration',
			pendingTarget: null,
			notice: null,
		});
		shellState.update((state) => ({
			...state,
			activePanel: 'editor',
			activeTarget: {
				kind: 'doc',
				path: '/content/Missing.md',
				title: 'Missing.md',
			},
		}));
		render(AppShell);

		expect(screen.getByLabelText('Empty workspace')).toHaveTextContent('No workspace files');
		await fireEvent.click(screen.getByRole('button', { name: 'New document' }));
		expect(screen.getByLabelText('Document details')).toHaveTextContent('/content/Untitled.md');
	});

	it('focuses sidebar search from the shell shortcut', async () => {
		render(AppShell);

		await fireEvent.keyDown(window, { key: 'f', metaKey: true });
		await waitFor(() => expect(screen.getByPlaceholderText('Search by name or path')).toHaveFocus());
	});

	it('opens settings and command palette dialogs from shared stores', async () => {
		shellState.update((state) => ({ ...state, activeDialog: 'settings' }));
		render(DialogHost);

		expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: 'Validation' }));
		expect(screen.getByLabelText('Validate on save')).toBeChecked();

		resetStores();
		shellState.update((state) => ({ ...state, commandPaletteOpen: true }));
		render(CommandPalette);

		expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
		await fireEvent.input(screen.getByPlaceholderText('Search files, folders, or commands…'), {
			target: { value: 'terminal' },
		});
		expect(screen.getByRole('option', { name: /New terminal tab/ })).toBeInTheDocument();
	});

	it('supports sidebar filtering, recent project view, and document selection', async () => {
		render(ShellSidebar);

		await fireEvent.input(screen.getByPlaceholderText('Search by name or path'), {
			target: { value: 'welcome' },
		});
		expect(screen.getByText('Welcome.md')).toBeInTheDocument();
		expect(screen.queryByText('hero.webp')).not.toBeInTheDocument();

		recentProjects.set([
			{
				path: '/tmp/fractalknow',
				name: 'fractalknow',
				source: 'folder-picker',
				openedAt: '2026-07-30T00:00:00.000Z',
			},
		]);
		await fireEvent.click(screen.getByRole('button', { name: 'Recent' }));
		expect(screen.getByLabelText('Recent projects')).toHaveTextContent('/tmp/fractalknow');
	});

	it('renders editor, activity, and terminal panels with persisted controls', async () => {
		shellState.set({
			sidebarOpen: true,
			commandPaletteOpen: false,
			activeDialog: 'none',
			activePanel: 'editor',
			activeTarget: {
				kind: 'doc',
				path: '/content/Welcome.md',
				title: 'Welcome.md',
			},
			editorMode: 'source',
			terminalOpen: true,
			searchQuery: '',
			rightPanelOpen: false,
			rightPanelView: 'activity',
			rightPanelWidth: 352,
		});
		documentWorkspace.update((state) => ({
			...state,
			openPaths: ['/migration', '/content/Welcome.md'],
			activePath: '/content/Welcome.md',
		}));
		render(EditorSurface);

		expect(screen.getByLabelText('Open document tabs')).toHaveTextContent('Welcome.md');
		expect(screen.getByLabelText('Document details')).toHaveTextContent('/content/Welcome.md');
		expect(screen.getByLabelText('Terminal panel')).toHaveTextContent('Terminal 1');
		await fireEvent.click(screen.getByRole('button', { name: 'New' }));
		expect(screen.getByLabelText('Terminal tabs')).toHaveTextContent('Terminal 2');

		shellState.update((state) => ({ ...state, activePanel: 'activity' }));
		await tick();
		expect(screen.getByLabelText('Activity details')).toHaveTextContent('Welcome.md');
	});
});
