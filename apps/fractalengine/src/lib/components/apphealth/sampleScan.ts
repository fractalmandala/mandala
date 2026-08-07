/**
 * Hand-written sample scan (notes module, miniature) so the renderer can be
 * previewed before real scan3-<module>.json files land. Also used by tests.
 */

import type { ModuleFlowScan } from './types';

export const sampleScan: ModuleFlowScan = {
	version: 1,
	scan: 'module-flow',
	project: { name: 'FractalEngine Studio', slug: 'fractalengine', date: '2026-07-18' },
	module: {
		id: 'notes',
		name: 'Notes',
		entryLayout: 'src/lib/modules/notes/components/NotesLayout.svelte',
		root: 'src/lib/modules/notes',
		summary: 'Sample scan — replace with a real scan3-<module>.json',
		externalModules: ['ai']
	},
	stats: { nodes: 14, edges: 18, components: 4, stateFiles: 1, commands: 2, ipcCalls: 3, flows: 3 },
	groups: [
		{ id: 'layout', label: 'Layout' },
		{ id: 'components', label: 'Components' },
		{ id: 'state', label: 'State' },
		{ id: 'commands', label: 'Commands & Palette' },
		{ id: 'ipc', label: 'IPC / Backend' },
		{ id: 'shared', label: 'Shared Components' },
		{ id: 'external', label: 'Other Modules' }
	],
	nodes: [
		{
			id: 'cmp:NotesLayout',
			label: 'NotesLayout.svelte',
			kind: 'layout',
			group: 'layout',
			path: 'src/lib/modules/notes/components/NotesLayout.svelte',
			loc: 210,
			summary: 'Module shell: list + editor panes, toolbar, search overlay',
			tags: ['entry']
		},
		{
			id: 'cmp:NoteList',
			label: 'NoteList.svelte',
			kind: 'component',
			group: 'components',
			path: 'src/lib/modules/notes/components/NoteList.svelte',
			loc: 160,
			summary: 'Scrollable note list with selection'
		},
		{
			id: 'cmp:NoteEditor',
			label: 'NoteEditor.svelte',
			kind: 'component',
			group: 'components',
			path: 'src/lib/modules/notes/components/NoteEditor.svelte',
			loc: 240,
			summary: 'Markdown editor pane with debounced autosave'
		},
		{
			id: 'cmp:NoteToolbar',
			label: 'NoteToolbar.svelte',
			kind: 'component',
			group: 'components',
			path: 'src/lib/modules/notes/components/NoteToolbar.svelte',
			loc: 90
		},
		{
			id: 'cmp:NoteSearch',
			label: 'NoteSearch.svelte',
			kind: 'component',
			group: 'components',
			path: 'src/lib/modules/notes/components/NoteSearch.svelte',
			loc: 120
		},
		{
			id: 'shared:VirtualList',
			label: 'VirtualList.svelte',
			kind: 'shared',
			group: 'shared',
			path: 'src/lib/components/VirtualList.svelte',
			summary: 'Shared virtualized list (not expanded)'
		},
		{
			id: 'state:notesState',
			label: 'notes.svelte.ts',
			kind: 'state',
			group: 'state',
			path: 'src/lib/modules/notes/state/notes.svelte.ts',
			loc: 420,
			summary: 'Notes store: documents, selection, dirty tracking'
		},
		{
			id: 'cmd:notes.new',
			label: 'notes.new',
			kind: 'command',
			group: 'commands',
			summary: 'Create a new note',
			tags: ['Cmd+N']
		},
		{
			id: 'cmd:notes.search',
			label: 'notes.search',
			kind: 'command',
			group: 'commands',
			tags: ['Cmd+Shift+F']
		},
		{
			id: 'ipc:loadNotes',
			label: 'loadNotes()',
			kind: 'ipc',
			group: 'ipc',
			path: 'src/lib/ipc.ts',
			summary: 'Read all notes from disk'
		},
		{
			id: 'ipc:saveNote',
			label: 'saveNote()',
			kind: 'ipc',
			group: 'ipc',
			path: 'src/lib/ipc.ts',
			summary: 'Persist one note to disk'
		},
		{
			id: 'ipc:deleteNote',
			label: 'deleteNote()',
			kind: 'ipc',
			group: 'ipc',
			path: 'src/lib/ipc.ts',
			summary: 'Move note to trash'
		},
		{
			id: 'fn:frontmatter',
			label: 'frontmatter.ts',
			kind: 'function',
			group: 'components',
			path: 'src/lib/modules/notes/frontmatter.ts',
			loc: 80,
			summary: 'Parse/serialize note frontmatter'
		},
		{
			id: 'ext:ai',
			label: 'AI module',
			kind: 'external',
			group: 'external',
			summary: 'Send note as chat context'
		}
	],
	edges: [
		{ from: 'cmp:NotesLayout', to: 'cmp:NoteList', kind: 'renders' },
		{ from: 'cmp:NotesLayout', to: 'cmp:NoteEditor', kind: 'renders' },
		{ from: 'cmp:NotesLayout', to: 'cmp:NoteToolbar', kind: 'renders' },
		{ from: 'cmp:NotesLayout', to: 'cmp:NoteSearch', kind: 'renders' },
		{ from: 'cmp:NoteList', to: 'shared:VirtualList', kind: 'imports' },
		{ from: 'cmp:NoteList', to: 'state:notesState', kind: 'reads' },
		{ from: 'cmp:NoteEditor', to: 'state:notesState', kind: 'reads' },
		{ from: 'cmp:NoteToolbar', to: 'state:notesState', kind: 'reads' },
		{ from: 'cmp:NoteSearch', to: 'state:notesState', kind: 'reads' },
		{ from: 'cmp:NoteEditor', to: 'state:notesState', kind: 'writes', label: 'edit buffer' },
		{ from: 'cmp:NoteList', to: 'state:notesState', kind: 'writes', label: 'select note' },
		{ from: 'state:notesState', to: 'fn:frontmatter', kind: 'calls' },
		{ from: 'cmd:notes.new', to: 'state:notesState', kind: 'commands', label: 'create()' },
		{ from: 'cmd:notes.search', to: 'cmp:NoteSearch', kind: 'commands', label: 'open()' },
		{ from: 'state:notesState', to: 'ipc:loadNotes', kind: 'ipc' },
		{ from: 'state:notesState', to: 'ipc:saveNote', kind: 'ipc' },
		{ from: 'state:notesState', to: 'ipc:deleteNote', kind: 'ipc' },
		{ from: 'cmp:NoteToolbar', to: 'ext:ai', kind: 'navigates', label: 'Send to AI' }
	],
	flows: [
		{
			id: 'create-note',
			name: 'Create note',
			trigger: "Cmd+N or toolbar 'New'",
			steps: ['cmd:notes.new', 'state:notesState', 'ipc:saveNote', 'cmp:NoteList'],
			summary: 'Command creates a note in state, persists it, list re-renders'
		},
		{
			id: 'autosave',
			name: 'Edit + autosave',
			trigger: 'Typing pause (debounced)',
			steps: ['cmp:NoteEditor', 'state:notesState', 'ipc:saveNote'],
			summary: 'Editor writes buffer into state; dirty note is saved'
		},
		{
			id: 'search',
			name: 'Search notes',
			trigger: 'Cmd+Shift+F',
			steps: ['cmd:notes.search', 'cmp:NoteSearch', 'state:notesState', 'cmp:NoteList'],
			summary: 'Palette opens search, query filters state, list updates'
		}
	],
	notes: [
		{
			title: 'State fan-in hotspot',
			body: 'notesState is read by 4 components and written by 2 — every interaction funnels through one store.',
			severity: 'info',
			path: 'src/lib/modules/notes/state/notes.svelte.ts'
		},
		{
			title: 'God-layout risk',
			body: 'NotesLayout renders 4 children directly and owns pane visibility switching.',
			severity: 'warn',
			path: 'src/lib/modules/notes/components/NotesLayout.svelte'
		}
	]
};
