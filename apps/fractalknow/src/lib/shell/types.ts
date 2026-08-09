export type ShellPanel = 'migration' | 'editor' | 'activity';

// Right-side secondary panel. Mirrors the source app's right-rail which can
// host the activity feed, diagnostics, version history, or a focused document
// overview.
export type RightPanelView = 'activity' | 'diagnostics' | 'version-history' | 'document';

export type DialogKind =
	| 'settings'
	| 'create-project'
	| 'clone-project'
	| 'publish'
	| 'consent'
	| 'bug-report'
	| 'feedback'
	| 'template-selection'
	| 'trash-failure'
	| 'unsaved-changes'
	| 'update-status'
	| 'crash-recovery'
	| 'folder-picker'
	| 'none';

export type EditorMode = 'rich' | 'source' | 'preview' | 'diff';

export type DocumentTargetKind = 'doc' | 'folder' | 'asset' | 'migration';

export type DocumentTarget = {
	kind: DocumentTargetKind;
	path: string;
	title: string;
	dirty?: boolean;
};

export type SidebarNode = {
	id: string;
	title: string;
	kind: DocumentTargetKind;
	path: string;
	children?: SidebarNode[];
};

export type ShellState = {
	sidebarOpen: boolean;
	commandPaletteOpen: boolean;
	activeDialog: DialogKind;
	activePanel: ShellPanel;
	activeTarget: DocumentTarget;
	editorMode: EditorMode;
	terminalOpen: boolean;
	searchQuery: string;
	rightPanelOpen: boolean;
	rightPanelView: RightPanelView;
	rightPanelWidth: number;
};

export type CommandGroup =
	| 'COMMANDS'
	| 'PROJECT'
	| 'FILE'
	| 'VIEW'
	| 'TERMINAL'
	| 'APPLICATION'
	| 'DIAGNOSTICS'
	| 'SETTINGS';

export type CommandItem = {
	id: string;
	title: string;
	group: CommandGroup;
	shortcut?: string;
	aliases?: string[];
	keywords?: string[];
	tags?: string[];
	desktopOnly?: boolean;
	/** Dev-scaffolding commands (dialog previews, diagnostics probes). Hidden
	 *  from the palette in production builds; visible under `import.meta.env.DEV`. */
	devOnly?: boolean;
	disabledReason?: string;
	run: () => void | Promise<void>;
};
