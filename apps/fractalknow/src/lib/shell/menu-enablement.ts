import type {
	MenuEnablementMap,
	OkDesktopBridge,
	OkMenuAction,
} from '$lib/desktop';

export type MenuSurface = 'shell' | 'document' | 'editor' | 'sidebar' | 'terminal' | 'history';

export type MenuContext = {
	activeDocument: string | null;
	activeSidebarSection: string | null;
	activeTerminal: string | null;
	canNavigateBack: boolean;
	canNavigateForward: boolean;
	hasValidation: boolean;
	isUpdating: boolean;
	isSearchActive: boolean;
	hasRecentProjects: boolean;
};

const DEFAULT_CONTEXT: MenuContext = {
	activeDocument: null,
	activeSidebarSection: null,
	activeTerminal: null,
	canNavigateBack: false,
	canNavigateForward: false,
	hasValidation: false,
	isUpdating: false,
	isSearchActive: false,
	hasRecentProjects: false,
};

const ALWAYS_AVAILABLE: OkMenuAction[] = [
	'new-doc',
	'new-folder',
	'new-project',
	'clone-project',
	'publish-project',
	'choose-template',
	'open-folder',
	'open-file',
	'switch-project',
	'open-github',
	'focus-command-palette',
	'settings',
	'settings-validation',
	'toggle-validate-on-save',
	'toggle-link-validation',
	'toggle-metadata-validation',
	'focus-search',
	'toggle-sidebar',
	'toggle-source',
	'show-activity',
	'show-diagnostics',
	'version-history',
	'toggle-terminal',
	'new-terminal',
	'report-bug',
	'send-feedback',
];

/**
 * Maps a menu item id to a list of contexts in which it can run. Items are
 * disabled by default unless the context says otherwise. The always-on
 * list covers navigation and shell-level commands that never need a target.
 */
function isEnabledFor(action: OkMenuAction, context: MenuContext): boolean {
	switch (action) {
		case 'rename':
		case 'delete':
		case 'duplicate':
		case 'move-to-trash':
		case 'reveal-in-finder':
		case 'copy-full-path':
		case 'copy-relative-path':
		case 'save-version':
		case 'close-active-tab-or-window':
		case 'new-from-template':
			return Boolean(context.activeDocument);
		case 'navigate-back':
			return context.canNavigateBack;
		case 'navigate-forward':
			return context.canNavigateForward;
		case 'kill-terminal':
			return Boolean(context.activeTerminal);
		case 'toggle-doc-panel':
		case 'toggle-show-hidden-files':
		case 'toggle-show-ok-folders':
		case 'toggle-show-only-markdown-files':
		case 'toggle-show-skills-section':
		case 'expand-all-tree':
		case 'collapse-all-tree':
			return Boolean(context.activeSidebarSection);
		default:
			return true;
	}
}

export function buildMenuEnablement(
	context: Partial<MenuContext> = {},
): MenuEnablementMap {
	const merged: MenuContext = { ...DEFAULT_CONTEXT, ...context };
	const result: MenuEnablementMap = {};
	for (const action of ALWAYS_AVAILABLE) {
		result[action] = true;
	}
	for (const action of ALL_MENU_ACTIONS) {
		if (action in result) continue;
		result[action] = isEnabledFor(action, merged);
	}
	return result;
}

export function allMenuActions(): OkMenuAction[] {
	return ALL_MENU_ACTIONS.slice();
}

const ALL_MENU_ACTIONS: OkMenuAction[] = [
	'new-doc',
	'new-folder',
	'new-from-template',
	'new-project',
	'clone-project',
	'publish-project',
	'choose-template',
	'open-folder',
	'open-file',
	'switch-project',
	'rename',
	'duplicate',
	'move-to-trash',
	'reveal-in-finder',
	'copy-full-path',
	'copy-relative-path',
	'delete',
	'close-active-tab-or-window',
	'settings',
	'settings-validation',
	'toggle-validate-on-save',
	'toggle-link-validation',
	'toggle-metadata-validation',
	'show-activity',
	'show-diagnostics',
	'toggle-sidebar',
	'toggle-source',
	'toggle-doc-panel',
	'toggle-show-hidden-files',
	'toggle-show-ok-folders',
	'toggle-show-only-markdown-files',
	'toggle-show-skills-section',
	'expand-all-tree',
	'collapse-all-tree',
	'save-version',
	'version-history',
	'focus-search',
	'focus-command-palette',
	'navigate-back',
	'navigate-forward',
	'toggle-terminal',
	'new-terminal',
	'kill-terminal',
	'open-github',
	'report-bug',
	'send-feedback',
];

let lastAppliedJson: string | null = null;
let pendingPromise: Promise<void> | null = null;

export async function applyMenuEnablement(
	bridge: OkDesktopBridge | null,
	context: Partial<MenuContext>,
): Promise<void> {
	const enablement = buildMenuEnablement(context);
	const json = JSON.stringify(enablement);
	if (json === lastAppliedJson) return;
	lastAppliedJson = json;
	if (!bridge) return;
	if (pendingPromise) {
		await pendingPromise;
	}
	pendingPromise = (async () => {
		try {
			await bridge.setMenuEnablement(enablement);
		} catch (error) {
			// The native menu is best-effort; if the platform cannot update
			// the enablement, swallow the error so the rest of the app
			// keeps working.
			console.warn('Failed to apply menu enablement', error);
		}
	})();
	await pendingPromise;
	pendingPromise = null;
}

export function resetMenuEnablementCache(): void {
	lastAppliedJson = null;
}
