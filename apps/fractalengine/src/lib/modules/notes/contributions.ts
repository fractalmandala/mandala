import { contributions } from '$lib/state/contributions.svelte';

contributions.registerCommands([
	{ id: 'notes.newNote', label: 'New Note', category: 'Notes', icon: '/icontheme-allicon/note.svg', scope: 'notes', run: () => { window.dispatchEvent(new CustomEvent('fractalnotes:new-note')); } },
	{ id: 'notes.openVault', label: 'Open Vault...', category: 'Notes', shortcutLabel: 'Cmd+Alt+O', icon: '/iconset/folder.svg', scope: 'notes', run: () => import('$lib/modules/notes/state/notes.svelte').then(({ notes }) => notes.openVaultFromFolder()) },
	{ id: 'notes.addFolderToVault', label: 'Add Folder to Vault...', category: 'Notes', shortcutLabel: 'Cmd+Alt+A', icon: '/iconset/addDirectory.svg', scope: 'notes', run: () => import('$lib/modules/notes/state/notes.svelte').then(({ notes }) => notes.addFolderToVault()) },
	{ id: 'notes.saveCurrentAsVault', label: 'Save Current as Vault...', category: 'Notes', shortcutLabel: 'Cmd+Alt+S', icon: '/iconset/save.svg', scope: 'notes', run: () => import('$lib/modules/notes/state/notes.svelte').then(({ notes }) => notes.requestSaveVaultFromMenu()) },
	{ id: 'notes.toggleVaultSidebar', label: 'Toggle Notes Vault Sidebar', category: 'Notes', icon: '/iconset/toolWindow.svg', scope: 'notes', run: () => import('$lib/modules/notes/state/notes.svelte').then(({ notes }) => notes.toggleSidebar1()) },
	{ id: 'notes.toggleFileSidebar', label: 'Toggle Notes File Sidebar', category: 'Notes', icon: '/iconset/toolWindow.svg', scope: 'notes', run: () => import('$lib/modules/notes/state/notes.svelte').then(({ notes }) => notes.toggleSidebar2()) },
	{ id: 'notes.toggleAiSidebar', label: 'Toggle Notes AI Sidebar', category: 'Notes', icon: '/iconset/toolWindow.svg', scope: 'notes', run: () => import('$lib/modules/notes/state/notes.svelte').then(({ notes }) => notes.toggleSidebar3()) },
	{ id: 'notes.retryPendingSave', label: 'Retry Pending Note Save', category: 'Notes', icon: '/iconset/save.svg', scope: 'notes', run: () => import('$lib/modules/notes/state/notes.svelte').then(({ notes }) => notes.retryPendingSave()) },
]);

contributions.registerKeybindings([
	{ combo: 'cmd+alt+o', scope: 'notes', commandId: 'notes.openVault' },
	{ combo: 'cmd+alt+a', scope: 'notes', commandId: 'notes.addFolderToVault' },
	{ combo: 'cmd+alt+s', scope: 'notes', commandId: 'notes.saveCurrentAsVault' },
]);

contributions.registerMenuActions([
	{ menuActionId: 'open_vault', commandId: 'notes.openVault' },
	{ menuActionId: 'add_folder_to_vault', commandId: 'notes.addFolderToVault' },
	{ menuActionId: 'save_as_vault', commandId: 'notes.saveCurrentAsVault' },
]);
