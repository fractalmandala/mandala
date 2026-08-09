import type { OkMenuAction } from '$lib/desktop';
import type { OkDesktopBridge } from '$lib/desktop';
import { createCommandItems, runCommandById } from './commands';

const menuCommandIds: Partial<Record<OkMenuAction, string>> = {
	'focus-command-palette': 'focus-command-palette',
	'focus-search': 'focus-search',
	'navigate-back': 'navigate-back',
	'navigate-forward': 'navigate-forward',
	'toggle-sidebar': 'toggle-sidebar',
	'toggle-doc-panel': 'toggle-doc-panel',
	'toggle-source': 'toggle-source',
	'toggle-show-hidden-files': 'toggle-show-hidden-files',
	'toggle-show-ok-folders': 'toggle-show-ok-folders',
	'toggle-show-only-markdown-files': 'toggle-show-only-markdown-files',
	'toggle-show-skills-section': 'toggle-show-skills-section',
	'expand-all-tree': 'expand-all-tree',
	'collapse-all-tree': 'collapse-all-tree',
	'toggle-terminal': 'toggle-terminal',
	'new-terminal': 'new-terminal',
	'kill-terminal': 'kill-terminal',
	'new-doc': 'new-doc',
	'new-folder': 'new-folder',
	'new-from-template': 'new-from-template',
	'new-project': 'new-project',
	'clone-project': 'clone-project',
	'publish-project': 'publish-project',
	'choose-template': 'choose-template',
	'open-folder': 'open-folder',
	'open-file': 'open-file',
	'switch-project': 'switch-project',
	duplicate: 'duplicate',
	rename: 'rename',
	'move-to-trash': 'move-to-trash',
	'reveal-in-finder': 'reveal-in-finder',
	'copy-full-path': 'copy-full-path',
	'copy-relative-path': 'copy-relative-path',
	settings: 'settings',
	'settings-validation': 'settings-validation',
	'toggle-validate-on-save': 'toggle-validate-on-save',
	'toggle-link-validation': 'toggle-link-validation',
	'toggle-metadata-validation': 'toggle-metadata-validation',
	'show-activity': 'show-activity',
	'show-diagnostics': 'show-diagnostics',
	delete: 'delete',
	'save-version': 'save-version',
	'version-history': 'version-history',
	'open-github': 'open-github',
	'report-bug': 'report-bug',
	'send-feedback': 'send-feedback',
	'close-active-tab-or-window': 'close-active-tab-or-window',
};

export async function handleMenuAction(
	action: OkMenuAction,
	bridge: OkDesktopBridge | null = null,
): Promise<void> {
	const commandId = menuCommandIds[action];
	if (!commandId) return;
	await runCommandById(createCommandItems(bridge), commandId);
}
