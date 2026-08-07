// Browser Module — Contributions Registry (§3.8)
//
// Commands and keybindings for browser windows. Scoped to 'browser' scope.
// Registered eagerly on module import; the shell reads from the registry.
//
// B8 adds the full command set. Before then, core toggles are scaffolded.

import { contributions } from '$lib/state/contributions.svelte';

contributions.registerCommands([
	{ id: 'browser.newTab', label: 'New Tab', category: 'Browser', shortcutLabel: 'Cmd+T', icon: '/iconset/add.svg', scope: 'global' as const, run: () => { window.dispatchEvent(new CustomEvent('browser:new-tab')); } },
	{ id: 'browser.closeTab', label: 'Close Tab', category: 'Browser', shortcutLabel: 'Cmd+W', icon: '/iconset/close.svg', scope: 'global' as const, run: () => { window.dispatchEvent(new CustomEvent('browser:close-tab')); } },
	{ id: 'browser.reopenClosedTab', label: 'Reopen Closed Tab', category: 'Browser', shortcutLabel: 'Cmd+Shift+T', icon: '/iconset/add.svg', scope: 'global' as const, run: () => { window.dispatchEvent(new CustomEvent('browser:reopen-tab')); } },
	{ id: 'browser.focusAddressBar', label: 'Focus Address Bar', category: 'Browser', shortcutLabel: 'Cmd+L', icon: '/iconset/explorer.svg', scope: 'global' as const, run: () => { window.dispatchEvent(new CustomEvent('browser:focus-address')); } },
	{ id: 'browser.reload', label: 'Reload Page', category: 'Browser', shortcutLabel: 'Cmd+R', icon: '/iconset/autoRefresh.svg', scope: 'global' as const, run: () => { window.dispatchEvent(new CustomEvent('browser:reload')); } },
	{ id: 'browser.showHistory', label: 'Show History', category: 'Browser', shortcutLabel: 'Cmd+Y', icon: '/iconset/history.svg', scope: 'global' as const, run: () => { window.dispatchEvent(new CustomEvent('browser:show-history')); } },
	{ id: 'browser.bookmarkPage', label: 'Bookmark This Page', category: 'Browser', shortcutLabel: 'Cmd+D', icon: '/iconset/bookmark.svg', scope: 'global' as const, run: () => { window.dispatchEvent(new CustomEvent('browser:bookmark-page')); } },
	{ id: 'browser.toggleFocus', label: 'Toggle Browser Window Focus', category: 'Browser', shortcutLabel: 'Cmd+`', icon: '/iconset/browse.svg', scope: 'global' as const, run: () => { window.dispatchEvent(new CustomEvent('browser:toggle-focus')); } },
]);

contributions.registerKeybindings([
	{ combo: 'cmd+t', scope: 'global' as const, commandId: 'browser.newTab' },
	{ combo: 'cmd+w', scope: 'global' as const, commandId: 'browser.closeTab' },
	{ combo: 'cmd+shift+t', scope: 'global' as const, commandId: 'browser.reopenClosedTab' },
	{ combo: 'cmd+l', scope: 'global' as const, commandId: 'browser.focusAddressBar' },
	{ combo: 'cmd+r', scope: 'global' as const, commandId: 'browser.reload' },
	{ combo: 'cmd+y', scope: 'global' as const, commandId: 'browser.showHistory' },
	{ combo: 'cmd+d', scope: 'global' as const, commandId: 'browser.bookmarkPage' },
]);
