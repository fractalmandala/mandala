import { contributions } from './contributions.svelte';
import { ideState } from './ide.svelte';
import { workspaceLayout } from './workspaceLayout.svelte';
import { shellState } from './shell.svelte';
import { appState } from './app.svelte';
import { dictation } from './dictation.svelte';

// Side-effect import: bookmarks module contributions register on load
import '$lib/modules/bookmarks/contributions';

function openSearchOverlay(): void {
	shellState.showSearchOverlay = true;
}

function openPaletteSubmode(mode: 'model' | 'tile' | 'template'): void {
	window.dispatchEvent(new CustomEvent('fractalengine:palette-submode', { detail: mode }));
}

contributions.registerCommands([
	{ id: 'core.toggleLeftSidebar', label: 'Toggle Left Sidebar', category: 'Layout', shortcutLabel: 'Header Click', icon: '/iconset/toolWindow.svg', scope: 'code', run: () => { workspaceLayout.toggle('code', 'left'); } },
	{ id: 'core.toggleRightSidebar', label: 'Toggle Right Sidebar', category: 'Layout', shortcutLabel: 'Header Click', icon: '/iconset/toolWindow.svg', scope: 'code', run: () => { workspaceLayout.toggle('code', 'right'); } },
	{ id: 'core.toggleTerminal', label: 'Toggle Terminal Console', category: 'Layout', shortcutLabel: 'Footer Click', icon: '/iconset/toolWindowConsole.svg', scope: 'code', run: () => ideState.toggleTerminal() },
	{ id: 'core.toggleBrowser', label: 'Toggle In-App Browser', category: 'Layout', shortcutLabel: 'Header Click', icon: '/iconset/IntelliJ Platform Icons (196).svg', scope: 'code', run: () => ideState.toggleBrowser() },
	{ id: 'core.openFile', label: 'Open File...', category: 'Workspace', shortcutLabel: 'Cmd+O', icon: '/iconset/fileUnread.svg', scope: 'global', run: () => ideState.browseAndOpenFile() },
	{ id: 'core.openFolder', label: 'Open Folder...', category: 'Workspace', shortcutLabel: 'Cmd+Shift+O', icon: '/iconset/folder.svg', scope: 'global', run: () => ideState.selectAndLoadDirectory() },
	{ id: 'core.saveActiveFile', label: 'Save Active File', category: 'Editor', shortcutLabel: 'Cmd+S', icon: '/iconset/save.svg', scope: 'global', run: () => ideState.activeFile && ideState.saveActiveFile() },
	{ id: 'core.runBuildPipeline', label: 'Run Build Pipeline', category: 'Pipeline', shortcutLabel: 'Header Click', icon: '/iconset/run.svg', scope: 'global', run: () => ideState.executeTerminalCommand('pnpm build') },
	{ id: 'core.openSettings', label: 'Open Settings Dialog', category: 'General', shortcutLabel: 'Footer Click', icon: '/iconset/blueKey.svg', scope: 'global', run: () => { shellState.showSettings = true; } },
	{ id: 'core.dictationToggle', label: 'Start/Stop Dictation', category: 'Dictation', shortcutLabel: 'Cmd+Shift+D', icon: '/iconset/record.svg', scope: 'global', run: () => dictation.toggle() },
	{ id: 'core.dictationStop', label: 'Stop Dictation', category: 'Dictation', icon: '/iconset/record.svg', scope: 'global', run: () => dictation.stop() },
	{ id: 'core.selectAiProviderModel', label: 'Select AI Provider Model...', category: 'AI Chat', shortcutLabel: 'Chat Dropdown', icon: '/iconset/Logo48Colored.svg', scope: 'global', run: () => openPaletteSubmode('model') },
	{ id: 'core.clearConsoleLogs', label: 'Clear Console Logs', category: 'Terminal', shortcutLabel: 'clear', icon: '/iconset/close.svg', scope: 'global', run: () => shellState.clearLogs() },
	{ id: 'core.addTile', label: 'Add Tile...', category: 'Canvas', icon: '/iconset/add.svg', scope: 'global', run: () => openPaletteSubmode('tile') },
	{ id: 'core.applyTemplate', label: 'Apply Template...', category: 'Canvas', icon: '/iconset/layout.svg', scope: 'global', run: () => openPaletteSubmode('template') },
	{ id: 'core.showTemplateGallery', label: 'Show Template Gallery', category: 'Canvas', icon: '/iconset/layout.svg', scope: 'global', run: () => appState.openTemplateGallery() },
	{ id: 'core.openAppSwitcher', label: 'Open App Switcher', category: 'General', shortcutLabel: 'Cmd+Space', icon: '/iconset/templateColor.svg', scope: 'global', run: () => { shellState.dockOpen = true; } },
	{ id: 'core.undo', label: 'Undo Last Action', category: 'History', shortcutLabel: 'Cmd+Z', icon: '/iconset/arrowLeft.svg', scope: 'global', run: () => shellState.undo() },
	{ id: 'core.redo', label: 'Redo Action', category: 'History', shortcutLabel: 'Cmd+Shift+Z', icon: '/iconset/arrowRight.svg', scope: 'global', run: () => shellState.redo() },
	{ id: 'core.closeWindow', label: 'Close Window', category: 'Workspace', icon: '/iconset/close.svg', scope: 'global', run: () => ideState.closeWindow() },
	{ id: 'core.about', label: 'About FractalEngine', category: 'General', icon: '/iconset/Logo48Colored.svg', scope: 'global', run: () => ideState.addLog('FractalEngine Studio v0.2.0 - premium web workspace.', 'success') },
	{ id: 'core.templateHome', label: 'Home Template', category: 'Templates', icon: '/iconset/templateColor.svg', scope: 'global', run: () => appState.applyTemplate('home') },
	{ id: 'core.templateCode', label: 'Code Template', category: 'Templates', icon: '/iconset/templateColor.svg', scope: 'global', run: () => appState.applyTemplate('code') },
	{ id: 'core.templateNotes', label: 'Notes Template', category: 'Templates', icon: '/iconset/templateColor.svg', scope: 'global', run: () => appState.applyTemplate('notes') },
	{ id: 'core.templateDesign', label: 'Design Template', category: 'Templates', icon: '/iconset/templateColor.svg', scope: 'global', run: () => appState.applyTemplate('design') },
	{ id: 'core.templateBookmarks', label: 'Bookmarks Template', category: 'Templates', icon: '/iconset/templateColor.svg', scope: 'global', run: () => appState.applyTemplate('bookmarks') },
	{ id: 'core.templateBlank', label: 'Blank Template', category: 'Templates', icon: '/iconset/templateColor.svg', scope: 'global', run: () => appState.applyTemplate('blank') },
	{ id: 'core.searchEverything', label: 'Search Everything', category: 'Global', shortcutLabel: 'Cmd+Shift+F', icon: '/iconset/search.svg', scope: 'global', run: () => openSearchOverlay() },
]);

contributions.registerKeybindings([
	{ combo: 'cmd+o', scope: 'global', commandId: 'core.openFile' },
	{ combo: 'cmd+shift+o', scope: 'global', commandId: 'core.openFolder' },
	{ combo: 'cmd+space', scope: 'global', commandId: 'core.openAppSwitcher' },
	{ combo: 'cmd+s', scope: 'code', commandId: 'core.saveActiveFile' },
	{ combo: 'cmd+z', scope: 'global', commandId: 'core.undo' },
	{ combo: 'cmd+shift+z', scope: 'global', commandId: 'core.redo' },
	{ combo: 'cmd+shift+f', scope: 'global', commandId: 'core.searchEverything' },
	{ combo: 'cmd+shift+d', scope: 'global', commandId: 'core.dictationToggle' },
]);

contributions.registerMenuActions([
	{ menuActionId: 'open_file', commandId: 'core.openFile' },
	{ menuActionId: 'open_folder', commandId: 'core.openFolder' },
	{ menuActionId: 'close_window', commandId: 'core.closeWindow' },
	{ menuActionId: 'about', commandId: 'core.about' },
	{ menuActionId: 'tpl_home', commandId: 'core.templateHome' },
	{ menuActionId: 'tpl_code', commandId: 'core.templateCode' },
	{ menuActionId: 'tpl_notes', commandId: 'core.templateNotes' },
	{ menuActionId: 'tpl_design', commandId: 'core.templateDesign' },
	{ menuActionId: 'tpl_blank', commandId: 'core.templateBlank' },
	{ menuActionId: 'tpl_bookmarks', commandId: 'core.templateBookmarks' },
]);
