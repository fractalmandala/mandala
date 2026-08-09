import type { OkDesktopBridge } from '$lib/desktop';
import { get } from 'svelte/store';
import {
	recordCommandFailed,
	recordCommandStarted,
	recordCommandSucceeded,
} from './command-history';
import {
	activeDocument,
	closeActiveDocument,
	createDocument,
	deleteActiveDocument,
	renameActiveDocument,
	saveActiveVersion,
	showVersionHistory,
} from './documents';
import {
	closeTerminalTab,
	createTerminalTab,
	setPreferredSidebarSection,
	setSettingsSection,
	setSidebarShowHidden,
	setValidateLinksOnSave,
	setValidateMetadataOnSave,
	setValidateOnSave,
	shellPreferences,
} from './preferences';
import {
	closeRightPanel,
	openCommandPalette,
	openDialog,
	openRightPanel,
	openTarget,
	navigateBack,
	navigateForward,
	navigationState,
	setActivePanel,
	setTerminalOpen,
	shellState,
	toggleEditorMode,
	toggleRightPanel,
	toggleSidebar,
	toggleTerminal,
} from './store';
import { startTerminalSession, stopTerminalSession } from './terminal';
import type { CommandItem } from './types';
import { pushToast } from './toasts';

export type CommandRunResult =
	| { ok: true }
	| { ok: false; reason: string };

function syncActiveDocumentTarget(): void {
	const document = get(activeDocument);
	if (document) openTarget(document);
}

const DESKTOP_ONLY_REASON = 'Available in the desktop app only.';
// Matches the feedback handoff destination used by the native bridge
// (src-tauri submit_feedback) until a dedicated FractalKnow repo exists.
const FRACTALKNOW_GITHUB_URL = 'https://github.com/inkeep/open-knowledge';
const GROUP_TAGS: Record<CommandItem['group'], string[]> = {
	COMMANDS: ['commands', 'actions'],
	PROJECT: ['project', 'workspace'],
	FILE: ['files', 'docs'],
	VIEW: ['navigation', 'view'],
	TERMINAL: ['terminal'],
	APPLICATION: ['app', 'help'],
	DIAGNOSTICS: ['diagnostics'],
	SETTINGS: ['settings'],
};

function withTags(
	command: CommandItem,
	extraTags: string[] = [],
): CommandItem {
	const base = GROUP_TAGS[command.group] ?? [];
	const tags = [...new Set([...base, ...extraTags, ...(command.tags ?? [])])];
	return { ...command, tags };
}

function gateDesktopOnly(command: CommandItem, isTauri: boolean): CommandItem {
	if (!command.desktopOnly) return command;
	if (isTauri) return command;
	return {
		...command,
		disabledReason: command.disabledReason ?? DESKTOP_ONLY_REASON,
	};
}

export function createCommandItems(bridge: OkDesktopBridge | null): CommandItem[] {
	const document = get(activeDocument);
	const preferences = get(shellPreferences);
	const editableDocumentReason =
		!document || document.kind === 'migration' ? 'Select an editable document first.' : undefined;
	const versionReason =
		!document || document.kind === 'migration' ? 'Select a document with version history first.' : undefined;
	const bridgeReason = bridge ? undefined : 'Native bridge is not ready.';
	const isTauri = bridge?.runtime === 'tauri';
	const navigation = get(navigationState);
	const backReason = navigation.backStack.length === 0 ? 'No previous document in history.' : undefined;
	const forwardReason = navigation.forwardStack.length === 0 ? 'No forward document in history.' : undefined;

	const items: CommandItem[] = [
		{
			id: 'focus-command-palette',
			title: 'Open command palette',
			group: 'VIEW',
			shortcut: '⌘K',
			aliases: ['commands', 'actions', 'omnibar'],
			keywords: ['search', 'actions'],
			run: openCommandPalette,
		},
		{
			id: 'focus-search',
			title: 'Focus sidebar search',
			group: 'VIEW',
			shortcut: '⌘F',
			aliases: ['find files', 'search files', 'filter sidebar'],
			keywords: ['search', 'files', 'sidebar'],
			run: () => {
				toggleSidebarOpenIfNeeded();
				setPreferredSidebarSection('files');
			},
		},
		{
			id: 'toggle-sidebar',
			title: 'Toggle sidebar',
			group: 'VIEW',
			// ⌥⌘S, never ⌘B: ⌘B is Bold in the editor (native menu owns this chord).
			shortcut: '⌥⌘S',
			aliases: ['show files', 'hide files', 'left rail'],
			keywords: ['left rail', 'tree'],
			run: toggleSidebar,
		},
		{
			id: 'toggle-source',
			title: 'Cycle rich/source/preview editor mode',
			group: 'VIEW',
			shortcut: '⌘⇧E',
			aliases: ['switch editor', 'preview markdown', 'source mode'],
			keywords: ['markdown', 'preview', 'rich', 'source'],
			run: toggleEditorMode,
		},
		{
			id: 'toggle-terminal',
			title: 'Toggle terminal panel',
			group: 'TERMINAL',
			shortcut: '⌘J',
			aliases: ['console', 'shell panel'],
			keywords: ['console', 'pty'],
			run: () => {
				toggleTerminal();
				if (get(shellState).terminalOpen) {
					void startTerminalSession(
						bridge,
						get(shellPreferences).activeTerminalTabId,
						bridge?.config.projectPath || undefined,
					);
				}
			},
		},
		{
			id: 'new-terminal',
			title: 'New terminal tab',
			group: 'TERMINAL',
			shortcut: '⌘⇧J',
			aliases: ['create shell', 'new shell'],
			keywords: ['console', 'pty', 'shell'],
			run: () => {
				const tab = createTerminalTab();
				setTerminalOpen(true);
				void startTerminalSession(bridge, tab.id, bridge?.config.projectPath || undefined);
			},
		},
		{
			id: 'kill-terminal',
			title: 'Close active terminal tab',
			group: 'TERMINAL',
			aliases: ['kill terminal', 'close shell'],
			keywords: ['console', 'pty', 'close'],
			run: () => {
				const tabId = get(shellPreferences).activeTerminalTabId;
				setTerminalOpen(closeTerminalTab());
				void stopTerminalSession(bridge, tabId);
			},
		},
		{
			id: 'show-migration',
			devOnly: true,
			title: 'Show migration board',
			group: 'DIAGNOSTICS',
			aliases: ['tasks', 'plan', 'checklist'],
			keywords: ['plan', 'tasks', 'status'],
			run: () => {
				openTarget({ kind: 'migration', path: '/migration', title: 'Migration Plan' });
			},
		},
		{
			id: 'open-editor',
			title: 'Open editor surface',
			group: 'VIEW',
			aliases: ['editor', 'document surface'],
			keywords: ['document', 'welcome'],
			run: () => {
				openTarget({ kind: 'doc', path: '/content/Welcome.md', title: 'Welcome.md' });
			},
		},
		{
			id: 'navigate-back',
			title: 'Navigate back',
			group: 'VIEW',
			shortcut: '⌘[',
			aliases: ['history back', 'previous location'],
			keywords: ['history', 'previous', 'document'],
			disabledReason: backReason,
			run: () => {
				navigateBack();
			},
		},
		{
			id: 'navigate-forward',
			title: 'Navigate forward',
			group: 'VIEW',
			shortcut: '⌘]',
			aliases: ['history forward', 'next location'],
			keywords: ['history', 'next', 'document'],
			disabledReason: forwardReason,
			run: () => {
				navigateForward();
			},
		},
		{
			id: 'show-activity',
			title: 'Show activity panel',
			group: 'VIEW',
			aliases: ['activity', 'history panel'],
			keywords: ['history', 'versions'],
			run: () => openRightPanel('activity'),
		},
		{
			id: 'show-diagnostics',
			title: 'Show diagnostics panel',
			group: 'DIAGNOSTICS',
			aliases: ['runtime status', 'bridge status', 'events'],
			keywords: ['runtime', 'bridge', 'events', 'diagnostics'],
			run: () => openRightPanel('diagnostics'),
		},
		{
			id: 'toggle-right-panel',
			title: 'Toggle right panel',
			group: 'VIEW',
			shortcut: '⌘`',
			aliases: ['right rail', 'right dock'],
			keywords: ['right', 'panel', 'rail'],
			run: () => toggleRightPanel(),
		},
		{
			id: 'close-right-panel',
			title: 'Close right panel',
			group: 'VIEW',
			aliases: ['hide right rail', 'collapse right panel'],
			keywords: ['right', 'panel', 'close'],
			run: () => {
				closeRightPanel();
			},
		},
		{
			id: 'new-doc',
			title: 'New document',
			group: 'FILE',
			shortcut: '⌘N',
			aliases: ['create document', 'new file'],
			keywords: ['create', 'file', 'markdown'],
			run: () => openTarget(createDocument('doc')),
		},
		{
			id: 'new-folder',
			title: 'New folder',
			group: 'FILE',
			shortcut: '⌘⇧N',
			aliases: ['create folder', 'new directory'],
			keywords: ['create', 'directory'],
			run: () => openTarget(createDocument('folder')),
		},
		{
			id: 'rename',
			title: 'Rename active document',
			group: 'FILE',
			shortcut: 'Enter',
			aliases: ['rename file', 'rename tab'],
			keywords: ['file', 'title'],
			disabledReason: editableDocumentReason,
			run: () => {
				renameActiveDocument();
				syncActiveDocumentTarget();
			},
		},
		{
			id: 'delete',
			title: 'Delete active document',
			group: 'FILE',
			shortcut: '⌫',
			aliases: ['trash file', 'remove file'],
			keywords: ['remove', 'trash'],
			disabledReason: editableDocumentReason,
			run: () => {
				deleteActiveDocument();
				syncActiveDocumentTarget();
			},
		},
		{
			id: 'save-version',
			title: 'Save active version',
			group: 'FILE',
			shortcut: '⌘S',
			aliases: ['save document', 'checkpoint'],
			keywords: ['snapshot', 'checkpoint'],
			disabledReason: versionReason,
			run: saveActiveVersion,
		},
		{
			id: 'version-history',
			title: 'Show version history',
			group: 'DIAGNOSTICS',
			shortcut: '⌘⇧H',
			aliases: ['history', 'versions', 'activity'],
			keywords: ['activity', 'snapshots'],
			disabledReason: versionReason,
			run: () => {
				showVersionHistory();
				openRightPanel('version-history');
			},
		},
		{
			id: 'close-active-tab-or-window',
			title: 'Close active tab',
			group: 'FILE',
			shortcut: '⌘W',
			aliases: ['close document', 'close file'],
			keywords: ['window'],
			run: () => {
				closeActiveDocument();
				syncActiveDocumentTarget();
			},
		},
		{
			id: 'new-project',
			title: 'Create project',
			group: 'FILE',
			shortcut: '⌘⌥N',
			aliases: ['new workspace', 'choose project folder'],
			keywords: ['new project', 'folder', 'workspace'],
			run: () => openDialog('create-project'),
		},
		{
			id: 'clone-project',
			title: 'Clone project',
			group: 'FILE',
			aliases: ['clone repository', 'git clone'],
			keywords: ['project', 'repository', 'git'],
			tags: ['git'],
			run: () => openDialog('clone-project'),
		},
		{
			id: 'publish-project',
			title: 'Publish project',
			group: 'FILE',
			aliases: ['share project', 'release project'],
			keywords: ['project', 'publish', 'release'],
			run: () => openDialog('publish'),
		},
		{
			id: 'settings',
			title: 'Open settings',
			group: 'SETTINGS',
			shortcut: '⌘,',
			aliases: ['preferences', 'configuration'],
			keywords: ['preferences', 'configuration'],
			run: () => openDialog('settings'),
		},
		{
			id: 'settings-validation',
			title: 'Open validation settings',
			group: 'SETTINGS',
			aliases: ['validation preferences', 'check settings'],
			keywords: ['validate', 'lint', 'links', 'metadata'],
			run: () => {
				setSettingsSection('validation');
				openDialog('settings');
			},
		},
		{
			id: 'toggle-validate-on-save',
			title: `${preferences.validateOnSave ? 'Disable' : 'Enable'} validate on save`,
			group: 'SETTINGS',
			aliases: ['validation on save', 'save checks'],
			keywords: ['validate', 'save', 'settings'],
			run: () => setValidateOnSave(!get(shellPreferences).validateOnSave),
		},
		{
			id: 'toggle-link-validation',
			title: `${preferences.validateLinksOnSave ? 'Disable' : 'Enable'} link validation`,
			group: 'SETTINGS',
			aliases: ['link checks', 'broken links'],
			keywords: ['validate', 'links', 'settings'],
			run: () => setValidateLinksOnSave(!get(shellPreferences).validateLinksOnSave),
		},
		{
			id: 'toggle-metadata-validation',
			title: `${preferences.validateMetadataOnSave ? 'Disable' : 'Enable'} metadata validation`,
			group: 'SETTINGS',
			aliases: ['frontmatter checks', 'metadata checks'],
			keywords: ['validate', 'metadata', 'frontmatter'],
			run: () => setValidateMetadataOnSave(!get(shellPreferences).validateMetadataOnSave),
		},
		{
			id: 'report-bug',
			title: 'Report a bug',
			group: 'APPLICATION',
			aliases: ['file issue', 'bug report'],
			keywords: ['issue', 'crash'],
			tags: ['bug'],
			run: () => openDialog('bug-report'),
		},
		{
			id: 'open-github',
			title: 'FractalKnow on GitHub',
			group: 'APPLICATION',
			aliases: ['github', 'source code', 'repository'],
			keywords: ['github', 'external', 'browser'],
			disabledReason: bridgeReason,
			run: async () => {
				await bridge?.shell.openExternal(FRACTALKNOW_GITHUB_URL);
			},
		},
		{
			id: 'bug-report-history',
			title: 'Bug report history',
			group: 'APPLICATION',
			aliases: ['report history', 'past bug reports'],
			keywords: ['bug', 'history', 'reports', 'desktop'],
			tags: ['bug', 'desktop'],
			desktopOnly: true,
			run: () => openDialog('crash-recovery'),
		},
		{
			id: 'send-feedback',
			title: 'Send feedback',
			group: 'APPLICATION',
			aliases: ['contact support', 'feedback'],
			keywords: ['contact', 'support'],
			run: () => openDialog('feedback'),
		},
		{
			id: 'show-consent',
			devOnly: true,
			title: 'Show consent request',
			group: 'APPLICATION',
			aliases: ['privacy consent', 'permissions'],
			keywords: ['telemetry', 'updates', 'collaboration', 'filesystem'],
			run: () => openDialog('consent'),
		},
		{
			id: 'show-crash-recovery',
			devOnly: true,
			title: 'Show crash recovery',
			group: 'DIAGNOSTICS',
			aliases: ['crash invite', 'recovery'],
			keywords: ['crash', 'recovery', 'diagnostics'],
			run: () => openDialog('crash-recovery'),
		},
		{
			id: 'show-update-status',
			devOnly: true,
			title: 'Show update status',
			group: 'DIAGNOSTICS',
			aliases: ['update available', 'update complete'],
			keywords: ['updater', 'version', 'release'],
			run: () => openDialog('update-status'),
		},
		{
			id: 'choose-template',
			title: 'Choose template',
			group: 'FILE',
			aliases: ['template selection', 'starter'],
			keywords: ['template', 'starter', 'scaffold'],
			run: () => openDialog('template-selection'),
		},
		{
			id: 'show-unsaved-changes',
			devOnly: true,
			title: 'Show unsaved changes confirmation',
			group: 'FILE',
			aliases: ['dirty files', 'discard changes'],
			keywords: ['unsaved', 'confirm', 'dirty'],
			run: () => openDialog('unsaved-changes'),
		},
		{
			id: 'show-trash-failure',
			devOnly: true,
			title: 'Show delete failure details',
			group: 'DIAGNOSTICS',
			aliases: ['trash failure', 'delete error'],
			keywords: ['delete', 'trash', 'error'],
			run: () => openDialog('trash-failure'),
		},
		{
			id: 'open-docs',
			devOnly: true,
			title: 'Open SvelteKit documentation',
			group: 'APPLICATION',
			aliases: ['docs', 'svelte docs'],
			keywords: ['external', 'browser', 'docs'],
			disabledReason: bridgeReason,
			run: async () => {
				await bridge?.shell.openExternal('https://svelte.dev/docs/kit');
			},
		},
		{
			id: 'detect-claude-protocol',
			devOnly: true,
			title: 'Detect claude:// protocol',
			group: 'DIAGNOSTICS',
			aliases: ['protocol detection', 'deep link'],
			keywords: ['deep link', 'native'],
			disabledReason: bridgeReason,
			desktopOnly: true,
			tags: ['desktop'],
			run: async () => {
				await bridge?.shell.detectProtocol('claude');
			},
		},
		{
			id: 'new-from-template',
			title: 'New document from template',
			group: 'FILE',
			aliases: ['template', 'scaffold', 'starter'],
			keywords: ['template', 'starter', 'scaffold'],
			run: () => openDialog('template-selection'),
		},
		{
			id: 'duplicate',
			title: 'Duplicate active document',
			group: 'FILE',
			shortcut: '⌘D',
			aliases: ['clone document', 'duplicate file'],
			keywords: ['duplicate', 'copy'],
			disabledReason: editableDocumentReason,
			run: () => {
				const target = get(activeDocument);
				if (!target) return;
				const copy = createDocument(target.kind === 'asset' ? 'asset' : 'doc');
				openTarget(copy);
			},
		},
		{
			id: 'move-to-trash',
			title: 'Move active document to trash',
			group: 'FILE',
			shortcut: '⌘⌫',
			aliases: ['trash file', 'delete'],
			keywords: ['trash', 'remove', 'delete'],
			disabledReason: editableDocumentReason,
			run: () => {
				deleteActiveDocument({ force: true });
				syncActiveDocumentTarget();
			},
		},
		{
			id: 'reveal-in-finder',
			title: 'Reveal active document in Finder',
			group: 'FILE',
			aliases: ['show in finder', 'open in finder', 'reveal'],
			keywords: ['finder', 'reveal', 'open'],
			disabledReason: bridgeReason,
			desktopOnly: true,
			tags: ['desktop'],
			run: async () => {
				const target = get(activeDocument);
				if (!target) return;
				await bridge?.shell.openExternal(target.path);
			},
		},
		{
			id: 'copy-full-path',
			title: 'Copy full path',
			group: 'FILE',
			aliases: ['copy absolute path'],
			keywords: ['copy', 'path', 'absolute'],
			disabledReason: editableDocumentReason,
			run: () => {
				const target = get(activeDocument);
				if (!target) return;
				void navigator.clipboard?.writeText(target.path);
			},
		},
		{
			id: 'copy-relative-path',
			title: 'Copy relative path',
			group: 'FILE',
			aliases: ['copy repo path'],
			keywords: ['copy', 'path', 'relative'],
			disabledReason: editableDocumentReason,
			run: () => {
				const target = get(activeDocument);
				if (!target) return;
				const relative = target.path.replace(/^\//, '');
				void navigator.clipboard?.writeText(relative);
			},
		},
		{
			id: 'toggle-doc-panel',
			title: 'Toggle document panel',
			group: 'VIEW',
			shortcut: '⌘⌥B',
			aliases: ['show document panel', 'right panel'],
			keywords: ['document', 'panel', 'right'],
			run: () => toggleRightPanel('document'),
		},
		{
			id: 'toggle-show-hidden-files',
			title: `${get(shellPreferences).sidebarShowHidden ? 'Hide' : 'Show'} hidden files`,
			group: 'FILE',
			shortcut: '⇧⌘.',
			aliases: ['hidden files', 'dotfiles'],
			keywords: ['hidden', 'files', 'sidebar'],
			run: () => setSidebarShowHidden(!get(shellPreferences).sidebarShowHidden),
		},
		{
			id: 'toggle-show-ok-folders',
			title: 'Toggle .ok folders in sidebar',
			group: 'FILE',
			aliases: ['ok folders', 'skills folders'],
			keywords: ['ok', 'folders', 'skills'],
			run: () => setPreferredSidebarSection('skills'),
		},
		{
			id: 'toggle-show-only-markdown-files',
			title: 'Show only markdown files in sidebar',
			group: 'FILE',
			aliases: ['markdown only', 'filter sidebar'],
			keywords: ['markdown', 'filter', 'sidebar'],
			run: () => setPreferredSidebarSection('docs'),
		},
		{
			id: 'toggle-show-skills-section',
			title: 'Toggle skills section in sidebar',
			group: 'FILE',
			aliases: ['skills section', 'sidebar sections'],
			keywords: ['skills', 'sidebar', 'section'],
			run: () => setPreferredSidebarSection('skills'),
		},
		{
			id: 'open-folder',
			title: 'Open folder as project',
			group: 'PROJECT',
			shortcut: '⌘O',
			aliases: ['open project folder', 'choose folder'],
			keywords: ['project', 'folder', 'open'],
			disabledReason: bridgeReason,
			desktopOnly: true,
			tags: ['desktop'],
			run: async () => {
				if (!bridge) return;
				const selected = await bridge.dialog.openFolder({
					defaultPath: bridge.config.projectPath || undefined,
				});
				if (!selected) return;
				// Native side validates the path, switches the project root, and
				// emits ok:project:switched, which the shell already hydrates from.
				await bridge.projects.setProjectPath(selected);
			},
		},
		{
			id: 'open-file',
			title: 'Open file from project',
			group: 'FILE',
			shortcut: '⇧⌘O',
			aliases: ['open document', 'pick file'],
			keywords: ['file', 'open', 'document'],
			disabledReason: bridgeReason,
			desktopOnly: true,
			tags: ['desktop'],
			run: async () => {
				if (!bridge) return;
				const selected = await bridge.dialog.openFile({
					defaultPath: bridge.config.projectPath || undefined,
				});
				if (!selected) return;
				const root = bridge.config.projectPath;
				if (root && selected.startsWith(root)) {
					const relative = selected.slice(root.length) || selected;
					const title = relative.split('/').filter(Boolean).at(-1) ?? relative;
					openTarget({ kind: 'doc', path: relative, title });
					return;
				}
				pushToast({
					kind: 'warning',
					title: 'File is outside the current project',
					body: 'Open the containing folder first, then pick the file again.',
				});
			},
		},
		{
			id: 'switch-project',
			title: 'Switch project',
			group: 'PROJECT',
			shortcut: '⇧⌘P',
			aliases: ['recent projects', 'change project'],
			keywords: ['project', 'switch', 'recent'],
			run: () => {
				// The project switcher dropdown lives in the sidebar header.
				toggleSidebarOpenIfNeeded();
				setPreferredSidebarSection('files');
				if (typeof window !== 'undefined') {
					window.document.querySelector<HTMLButtonElement>('.project-switcher')?.click();
				}
			},
		},
		{
			id: 'expand-all-tree',
			title: 'Expand all tree',
			group: 'FILE',
			aliases: ['expand all', 'open all folders'],
			keywords: ['expand', 'tree', 'folders'],
			run: () => {
				/* The sidebar tracks its own expanded state; this command fires
				 * a custom event so the ShellSidebar component can react. */
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent('ok:sidebar-expand-all'));
				}
			},
		},
		{
			id: 'collapse-all-tree',
			title: 'Collapse all tree',
			group: 'FILE',
			aliases: ['collapse all', 'close all folders'],
			keywords: ['collapse', 'tree', 'folders'],
			run: () => {
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent('ok:sidebar-collapse-all'));
				}
			},
		},
	];

	// Dev-scaffolding rows (dialog previews, diagnostic probes) ship in the
	// registry for development but are filtered out of production palettes.
	const visible = import.meta.env.DEV ? items : items.filter((item) => !item.devOnly);
	return visible.map((item) => gateDesktopOnly(withTags(item), isTauri));
}

function toggleSidebarOpenIfNeeded(): void {
	if (!get(shellPreferences).sidebarOpen) toggleSidebar();
}

export async function runCommandById(
	commands: CommandItem[],
	commandId: string,
): Promise<CommandRunResult> {
	const command = commands.find((item) => item.id === commandId);
	if (!command) {
		const reason = `Unknown command: ${commandId}`;
		recordCommandFailed(commandId, reason);
		return { ok: false, reason };
	}
	if (command.disabledReason) {
		recordCommandFailed(command.id, command.disabledReason);
		return { ok: false, reason: command.disabledReason };
	}

	try {
		recordCommandStarted(command);
		await command.run();
		recordCommandSucceeded(command);
		return { ok: true };
	} catch (error) {
		const reason = error instanceof Error ? error.message : 'Command failed.';
		recordCommandFailed(command.id, reason);
		return { ok: false, reason };
	}
}

export function filterCommands(
	commands: CommandItem[],
	query: string,
	recentIds: string[] = [],
	tag: string | null = null,
): CommandItem[] {
	const normalized = query.trim().toLowerCase();
	const filteredByTag = tag
		? commands.filter((command) =>
				(command.tags ?? []).some((t) => t.toLowerCase() === tag),
			)
		: commands;

	return filteredByTag
		.map((command, index) => ({
			command,
			index,
			score: scoreCommand(command, normalized, recentIds),
		}))
		.filter((match) => match.score > 0)
		.sort((left, right) => right.score - left.score || left.index - right.index)
		.map((match) => match.command);
}

function scoreCommand(command: CommandItem, query: string, recentIds: string[]): number {
	const title = command.title.toLowerCase();
	const group = command.group.toLowerCase();
	const shortcut = command.shortcut?.toLowerCase() ?? '';
	const aliases = command.aliases?.join(' ').toLowerCase() ?? '';
	const keywords = command.keywords?.join(' ').toLowerCase() ?? '';
	const haystack = `${title} ${group} ${shortcut} ${aliases} ${keywords}`;
	const recentRank = recentIds.indexOf(command.id);
	const recentBoost = recentRank >= 0 ? Math.max(16 - recentRank, 1) : 0;

	if (query.length === 0) return 1 + recentBoost;
	if (title === query) return 100 + recentBoost;
	if (command.aliases?.some((alias) => alias.toLowerCase() === query)) return 92 + recentBoost;
	if (title.startsWith(query)) return 80 + recentBoost;
	if (title.split(/\s+/).some((word) => word.startsWith(query))) return 65 + recentBoost;
	if (abbreviation(title) === query) return 62 + recentBoost;
	if (group.startsWith(query)) return 45 + recentBoost;
	if (command.aliases?.some((alias) => alias.toLowerCase().includes(query))) return 42 + recentBoost;
	if (keywords.includes(query)) return 35 + recentBoost;
	if (haystack.includes(query)) return 20 + recentBoost;
	if (isOrderedSubsequence(query, title)) return 12 + recentBoost;

	return query.split(/\s+/).every((part) => haystack.includes(part)) ? 10 + recentBoost : 0;
}

function abbreviation(value: string): string {
	return value
		.split(/\s+/)
		.map((word) => word[0])
		.join('');
}

function isOrderedSubsequence(query: string, value: string): boolean {
	let queryIndex = 0;
	for (const char of value) {
		if (char === query[queryIndex]) queryIndex += 1;
		if (queryIndex === query.length) return true;
	}
	return false;
}
