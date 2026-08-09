export type MigrationSubtask = {
	title: string;
	outcome: string;
	status: 'done' | 'active' | 'queued';
};

export type MigrationGroup = {
	title: string;
	summary: string;
	status: 'done' | 'active' | 'queued';
	subtasks: MigrationSubtask[];
};

export const migrationGroups: MigrationGroup[] = [
	{
		title: 'Add a compatibility desktop bridge over Tauri',
		summary: 'Keep the old app-facing desktop boundary while replacing Electron IPC underneath.',
		status: 'active',
		subtasks: [
			{
				title: 'Define typed OkDesktopBridge facade',
				outcome: 'Svelte modules import one bridge shape from $lib/desktop.',
				status: 'done',
			},
			{
				title: 'Expose Tauri command-backed app and config metadata',
				outcome: 'Rust commands provide native runtime and window config details.',
				status: 'done',
			},
			{
				title: 'Wire shell and dialog plugin adapters',
				outcome: 'openExternal and openFolder use official Tauri plugins.',
				status: 'done',
			},
			{
				title: 'Map Electron events to Tauri events',
				outcome: 'Project switch, menu action, deep link, update, and server events flow through listen/emit.',
				status: 'active',
			},
			{
				title: 'Add typed bridge event subscriptions',
				outcome: 'Deep link, update status, server status, crash invite, and consent-required channels are exposed by the desktop bridge.',
				status: 'done',
			},
			{
				title: 'Replace unsupported fallbacks with native commands',
				outcome: 'Theme, protocol detection, updater, terminal, worktree, and bug-report calls are implemented.',
				status: 'active',
			},
		],
	},
	{
		title: 'Port the app shell from React to Svelte',
		summary: 'Move the high-level workspace chrome before deep editor behavior.',
		status: 'active',
		subtasks: [
			{
				title: 'Create Svelte shell layout',
				outcome: 'Rail, main work area, runtime status, and bridge config render as Svelte.',
				status: 'done',
			},
			{
				title: 'Port provider responsibilities',
				outcome: 'Theme, i18n, telemetry, persistence, and bridge listeners mount in SvelteKit layout modules.',
				status: 'done',
			},
			{
				title: 'Port navigation state',
				outcome: 'Hash/document routing, back-forward handling, and same-tab behavior match the React shell.',
				status: 'active',
			},
			{
				title: 'Persist active panel and target',
				outcome: 'The Svelte shell restores the last active panel and document target from persisted shell preferences.',
				status: 'done',
			},
			{
				title: 'Port shell error boundaries',
				outcome: 'Svelte boundaries replace React error boundaries for recoverable shell crashes.',
				status: 'done',
			},
			{
				title: 'Route shell shortcuts through command runner',
				outcome: 'Global shortcuts for palette, sidebar, terminal, settings, document creation, save, history, close, rename, delete, and editor mode use the same command model as menus and palette.',
				status: 'done',
			},
		],
	},
	{
		title: 'Port shared stores/hooks',
		summary: 'Turn React hooks and external stores into Svelte stores, runes, and plain services.',
		status: 'active',
		subtasks: [
			{
				title: 'Classify hook types',
				outcome: 'Pure services stay as TypeScript, UI hooks become Svelte stores, lifecycle hooks move to components.',
				status: 'active',
			},
			{
				title: 'Port desktop listener stores',
				outcome: 'Deep link, update notice, crash invite, consent, and recent-project stores subscribe through the bridge.',
				status: 'active',
			},
			{
				title: 'Add recent projects store',
				outcome: 'Recent project selection, reopening, removal, and clearing are persisted in a Svelte store for dialog/settings consumers.',
				status: 'done',
			},
			{
				title: 'Record extended desktop listener state',
				outcome: 'Deep link, update status, server status, crash invite, and consent-required events update Svelte stores from the shell lifecycle.',
				status: 'done',
			},
			{
				title: 'Add bridge event history store',
				outcome: 'Desktop bridge events are retained in a bounded history store for diagnostics beyond the latest event and counter.',
				status: 'done',
			},
			{
				title: 'Add bridge event consumers',
				outcome: 'Settings runtime diagnostics render deep-link, update, server, crash, consent, and recent bridge event state from Svelte stores.',
				status: 'done',
			},
			{
				title: 'Port config and theme stores',
				outcome: 'Project config, appearance, validation, sync/collaboration, and agent/tool config are typed Svelte stores with validation and persistence state.',
				status: 'done',
			},
			{
				title: 'Finish hook classification',
				outcome: 'React hook inventory is classified by migration kind, owner, and parity status in a Svelte-side migration data module.',
				status: 'active',
			},
			{
				title: 'Port terminal and panel persistence stores',
				outcome: 'Dock, terminal height, doc panel width, and tab persistence survive reloads.',
				status: 'done',
			},
			{
				title: 'Persist shell preferences',
				outcome: 'Theme source, editor mode, sidebar state, and terminal visibility survive reloads.',
				status: 'done',
			},
			{
				title: 'Persist sidebar width',
				outcome: 'Sidebar width is user-resizable with pointer and keyboard controls and survives reloads through Svelte preferences.',
				status: 'done',
			},
			{
				title: 'Persist terminal dock height',
				outcome: 'Terminal dock height is user-resizable with pointer and keyboard controls and survives reloads through Svelte preferences.',
				status: 'done',
			},
			{
				title: 'Persist document and activity panel width',
				outcome: 'Editor details and activity side panels share a resizable persisted width preference with pointer and keyboard controls.',
				status: 'done',
			},
			{
				title: 'Persist active sidebar section',
				outcome: 'The sidebar restores its active Files or Recent Projects section and reuses the persisted recent-project store.',
				status: 'done',
			},
			{
				title: 'Persist terminal tab list',
				outcome: 'Terminal tabs, active terminal tab, dock visibility, and menu-backed new/close tab commands survive reloads.',
				status: 'done',
			},
			{
				title: 'Record desktop bridge event state',
				outcome: 'Menu and project switch events have Svelte stores that future listeners can extend.',
				status: 'done',
			},
		],
	},
	{
		title: 'Port editor and document surfaces',
		summary: 'Move document context, collaboration, editor lifecycle, and viewers after the shell is stable.',
		status: 'active',
		subtasks: [
			{
				title: 'Port document context',
				outcome: 'Active target, open tabs, sync state, transitions, and large-file guards work in Svelte.',
				status: 'active',
			},
			{
				title: 'Create Svelte document workspace store',
				outcome: 'Open tabs, active document, dirty state, rename/delete, and version snapshots are Svelte-native.',
				status: 'done',
			},
			{
				title: 'Replace editor placeholder with document state surface',
				outcome: 'The shell renders live document content and updates source/rich draft state from Svelte stores.',
				status: 'done',
			},
			{
				title: 'Split editor modes into Svelte components',
				outcome: 'Rich draft, source editing, markdown preview, asset preview, and version history are isolated surfaces.',
				status: 'done',
			},
			{
				title: 'Integrate TipTap without React wrappers',
				outcome: 'Editor creation, destruction, extensions, selection state, and Markdown serialization use TipTap core.',
				status: 'active',
			},
			{
				title: 'Mount TipTap rich editor',
				outcome: 'Rich mode creates and destroys TipTap core in Svelte, syncs document content, and exposes a minimal formatting toolbar.',
				status: 'done',
			},
			{
				title: 'Track TipTap selection and formatting state',
				outcome: 'Active marks, active list/heading nodes, selection emptiness, and character counts update in Svelte state.',
				status: 'done',
			},
			{
				title: 'Round-trip rich formatting through Markdown',
				outcome: 'Rich editor HTML is serialized back into the shared Markdown document model used by source and preview modes.',
				status: 'done',
			},
			{
				title: 'Port CodeMirror source mode',
				outcome: 'Source editor, lint decorations, find/replace, and undo keymaps keep parity.',
				status: 'active',
			},
			{
				title: 'Mount CodeMirror in source editor',
				outcome: 'Source mode uses CodeMirror with markdown language support, history, search commands, and tab indentation.',
				status: 'done',
			},
			{
				title: 'Port document viewers',
				outcome: 'Markdown, MDX fallback, Mermaid, images/assets, diffs, and skill file viewers render correctly.',
				status: 'active',
			},
			{
				title: 'Render Markdown and asset viewer paths',
				outcome: 'Markdown documents render through a sanitized viewer and assets have a dedicated preview surface.',
				status: 'done',
			},
			{
				title: 'Add explicit preview editor mode',
				outcome: 'Rich, source, and preview modes are all reachable from toolbar/settings and route to separate Svelte surfaces.',
				status: 'done',
			},
			{
				title: 'Port collaboration wiring',
				outcome: 'Hocuspocus/Yjs provider lifecycle, awareness, offline cache, and persistence match current behavior.',
				status: 'queued',
			},
		],
	},
	{
		title: 'Port dialogs, settings, command palette, sidebar',
		summary: 'Move secondary workflows after core document navigation exists.',
		status: 'active',
		subtasks: [
			{
				title: 'Port sidebar and file tree',
				outcome: 'Create, rename, drag/drop, reveal, filters, hidden files, and skills sections match current behavior.',
				status: 'active',
			},
			{
				title: 'Bind sidebar to Svelte document workspace',
				outcome: 'Created, renamed, deleted, dirty, and selected documents update immediately in the sidebar.',
				status: 'done',
			},
			{
				title: 'Add sidebar filtering and reveal state',
				outcome: 'Search, type filters, reveal-active behavior, empty state, and persisted sidebar filter preferences are Svelte-native.',
				status: 'done',
			},
			{
				title: 'Port command palette',
				outcome: 'Search, semantic command ranking, keyboard focus, and action dispatch work in Svelte.',
				status: 'active',
			},
			{
				title: 'Add command enablement states',
				outcome: 'Commands expose disabled reasons and the palette/menu/shortcut runner avoids invalid actions consistently.',
				status: 'done',
			},
			{
				title: 'Add command palette keyboard navigation',
				outcome: 'Arrow keys, Enter, Escape, active option state, empty state, and scored search ranking are Svelte-native.',
				status: 'done',
			},
			{
				title: 'Add command palette recents and status',
				outcome: 'Recent command ordering plus running/error command feedback are persisted and rendered in the Svelte palette.',
				status: 'done',
			},
			{
				title: 'Route file commands through document store',
				outcome: 'New, close, rename, delete, save version, and history commands mutate the same document state.',
				status: 'done',
			},
			{
				title: 'Port settings',
				outcome: 'Settings routing, search, config writes, theme controls, and validation surfaces are restored.',
				status: 'active',
			},
			{
				title: 'Add state-backed settings sections',
				outcome: 'Project, editor, appearance, validation, and runtime settings read/write Svelte stores and desktop bridge state.',
				status: 'done',
			},
			{
				title: 'Port dialogs',
				outcome: 'Create project, clone, publish, consent, bug report, feedback, templates, and trash failures are restored.',
				status: 'active',
			},
			{
				title: 'Wire create-project folder selection',
				outcome: 'Create project dialog uses the Tauri folder picker and stores the selected project in Svelte state.',
				status: 'done',
			},
			{
				title: 'Port desktop menu parity',
				outcome: 'Tauri menus dispatch to the same Svelte command handlers as keyboard and palette actions.',
				status: 'active',
			},
		],
	},
];
