import { contributions } from '$lib/state/contributions.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';

contributions.registerCommands([
	{ id: 'ai.newSession', label: 'New AI Session', category: 'AI', icon: '/iconset/add.svg', scope: 'ai', run: () => import('$lib/modules/ai/state/ai.svelte').then(({ aiWorkspace }) => aiWorkspace.newSession()) },
	{ id: 'ai.toggleSessionsSidebar', label: 'Toggle AI Sessions Sidebar', category: 'AI', icon: '/iconset/toolWindow.svg', scope: 'ai', run: () => { workspaceLayout.toggle('agent', 'left'); } },
	{ id: 'ai.toggleWorkPanel', label: 'Toggle AI Work Panel', category: 'AI', icon: '/iconset/toolWindow.svg', scope: 'ai', run: () => { workspaceLayout.toggle('agent', 'right'); } },
	{ id: 'ai.openFilesPanel', label: 'Open Files Panel', category: 'AI', icon: '/iconset/folder.svg', scope: 'ai', run: () => import('$lib/modules/ai/state/ai.svelte').then(({ aiWorkspace }) => aiWorkspace.setWorkTab('files')) },
	{ id: 'ai.openTerminalPanel', label: 'Open Terminal Panel', category: 'AI', icon: '/iconset/toolWindowConsole.svg', scope: 'ai', run: () => import('$lib/modules/ai/state/ai.svelte').then(({ aiWorkspace }) => aiWorkspace.setWorkTab('terminal')) },
]);

contributions.registerHeaderActions([
	{ scope: 'ai', kind: 'icon', ariaLabel: 'New AI session', icon: '/iconset/add.svg', commandId: 'ai.newSession', order: 30 },
]);
