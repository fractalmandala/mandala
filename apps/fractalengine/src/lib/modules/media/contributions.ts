import { contributions } from '$lib/state/contributions.svelte';
import { media } from './state/media.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';

contributions.registerCommands([
	{ id: 'media.addToGallery', label: 'Add to Gallery', category: 'Media', icon: '/iconset/add.svg', scope: 'media', run: payload => { const paths = Array.isArray(payload) && payload.every(path => typeof path === 'string') ? payload : []; if (paths.length) return media.importPaths(paths); return media.pickImportSources('files'); } },
	{ id: 'media.importFolder', label: 'Import Media Folder', category: 'Media', icon: '/iconset/addDirectory.svg', scope: 'media', run: () => media.pickImportSources('folder') },
	{ id: 'media.newFolder', label: 'New Media Folder', category: 'Media', icon: '/iconset/add.svg', scope: 'media', shortcutLabel: 'Cmd+Shift+N', run: () => { const name = prompt('Folder name'); if (name?.trim()) void media.createFolder(media.activeScope.type === 'folder' ? media.activeScope.path : '', name.trim()); } },
	{ id: 'media.focusSearch', label: 'Focus Media Search', category: 'Media', icon: '/iconset/search.svg', scope: 'media', shortcutLabel: 'Cmd+F', run: () => document.querySelector<HTMLInputElement>('.media-search')?.focus() },
	{ id: 'media.toggleInspector', label: 'Toggle Media Inspector', category: 'Media', icon: '/iconset/rightExpand.svg', scope: 'media', shortcutLabel: 'Cmd+Shift+I', run: () => { workspaceLayout.toggle('media', 'right'); } },
	{ id: 'media.trashSelection', label: 'Remove Selected Media', category: 'Media', icon: '/iconset/delete.svg', scope: 'media', shortcutLabel: 'Cmd+Backspace', run: () => { const items = media.selectedItems; if (items.length && confirm('Moves to Trash — cannot be undone from the app.')) void media.trash(items.map(item => item.relPath)); } },
	{ id: 'media.selectAll', label: 'Select All Media', category: 'Media', icon: '/iconset/selectAll.svg', scope: 'media', shortcutLabel: 'Cmd+A', run: () => media.selectAll() },
	{ id: 'media.pinSelection', label: 'Pin Selected Media', category: 'Media', icon: '/iconset/pin.svg', scope: 'media', run: () => void media.setPinned(media.selectedItems.map(item => item.id), true) },
]);
contributions.registerContextMenuActions([
	{ id: 'media.add-to-gallery', label: 'Add to Gallery', commandId: 'media.addToGallery', scope: 'global', visible: payload => Array.isArray(payload) && payload.length > 0 },
]);
contributions.registerKeybindings([
	{ combo: 'cmd+shift+n', scope: 'media', commandId: 'media.newFolder' },
	{ combo: 'cmd+f', scope: 'media', commandId: 'media.focusSearch' },
	{ combo: 'cmd+shift+i', scope: 'media', commandId: 'media.toggleInspector' },
	{ combo: 'cmd+backspace', scope: 'media', commandId: 'media.trashSelection' },
	{ combo: 'cmd+a', scope: 'media', commandId: 'media.selectAll' },
]);
contributions.registerHeaderActions([
	{ scope: 'media', kind: 'strip', ariaLabel: 'Import media', title: 'Import…', icon: '/iconset/add.svg', commandId: 'media.addToGallery', order: 10 },
	{ scope: 'media', kind: 'icon', ariaLabel: 'Import media folder', title: 'Import Folder…', icon: '/iconset/addDirectory.svg', commandId: 'media.importFolder', order: 15 },
	{ scope: 'media', kind: 'icon', ariaLabel: 'New media folder', title: 'New Folder', icon: '/iconset/add.svg', commandId: 'media.newFolder', order: 20 },
	{ scope: 'media', kind: 'icon', ariaLabel: 'Toggle media inspector', title: 'Inspector', icon: '/iconset/rightExpand.svg', commandId: 'media.toggleInspector', order: 30 },
]);
