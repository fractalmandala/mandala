import { contributions } from '$lib/state/contributions.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';

contributions.registerCommands([
	{ id: 'designer.toggleLayersSidebar', label: 'Toggle Design Layers Sidebar', category: 'Design', icon: '/iconset/toolWindow.svg', scope: 'design', run: () => { workspaceLayout.toggle('design', 'left'); } },
	{ id: 'designer.toggleAiSidebar', label: 'Toggle Design AI Sidebar', category: 'Design', icon: '/iconset/toolWindow.svg', scope: 'design', run: () => { workspaceLayout.toggle('design', 'right'); } },
	{ id: 'designer.resetScene', label: 'Reset Design Scene', category: 'Design', icon: '/iconset/refresh.svg', scope: 'design', run: () => import('$lib/modules/designer/state/designcanvas.svelte').then(({ designcanvas }) => { designcanvas.resetScene(); }) },
	{ id: 'designer.centerCanvas', label: 'Center Design Canvas', category: 'Design', icon: '/iconset/layout.svg', scope: 'design', run: () => { window.dispatchEvent(new CustomEvent('fractaldesign:center-view')); } },
	{ id: 'designer.zoom100', label: 'Zoom to 100%', category: 'Design', icon: '/iconset/zoomIn.svg', scope: 'design', shortcutLabel: 'Cmd+0', run: () => { window.dispatchEvent(new CustomEvent('fractaldesign:zoom', { detail: '100' })); } },
	{ id: 'designer.zoomFit', label: 'Zoom to Fit', category: 'Design', icon: '/iconset/target.svg', scope: 'design', shortcutLabel: 'Cmd+1', run: () => { window.dispatchEvent(new CustomEvent('fractaldesign:zoom', { detail: 'fit' })); } },
	{ id: 'designer.zoomSelection', label: 'Zoom to Selection', category: 'Design', icon: '/iconset/target.svg', scope: 'design', shortcutLabel: 'Cmd+2', run: () => { window.dispatchEvent(new CustomEvent('fractaldesign:zoom', { detail: 'selection' })); } },
	{ id: 'designer.zoomIn', label: 'Zoom In', category: 'Design', icon: '/iconset/zoomIn.svg', scope: 'design', shortcutLabel: 'Cmd+=', run: () => { window.dispatchEvent(new CustomEvent('fractaldesign:zoom', { detail: 'in' })); } },
	{ id: 'designer.zoomOut', label: 'Zoom Out', category: 'Design', icon: '/iconset/zoomOut.svg', scope: 'design', shortcutLabel: 'Cmd+-', run: () => { window.dispatchEvent(new CustomEvent('fractaldesign:zoom', { detail: 'out' })); } },
	{ id: 'designer.flipHorizontal', label: 'Flip Horizontal', category: 'Design', icon: '/iconset/arrowLeftRight.svg', scope: 'design', shortcutLabel: 'Shift+H', run: () => import('$lib/modules/designer/state/designcanvas.svelte').then(({ designcanvas }) => designcanvas.flipSelected('horizontal')) },
	{ id: 'designer.flipVertical', label: 'Flip Vertical', category: 'Design', icon: '/iconset/moveUp.svg', scope: 'design', shortcutLabel: 'Shift+V', run: () => import('$lib/modules/designer/state/designcanvas.svelte').then(({ designcanvas }) => designcanvas.flipSelected('vertical')) },
	{ id: 'designer.tidyHorizontal', label: 'Tidy Up Horizontally', category: 'Design', icon: '/iconset/layout.svg', scope: 'design', run: () => import('$lib/modules/designer/state/designcanvas.svelte').then(({ designcanvas }) => designcanvas.tidyUp('horizontal')) },
	{ id: 'designer.tidyVertical', label: 'Tidy Up Vertically', category: 'Design', icon: '/iconset/layout.svg', scope: 'design', run: () => import('$lib/modules/designer/state/designcanvas.svelte').then(({ designcanvas }) => designcanvas.tidyUp('vertical')) },
	{ id: 'designer.toolMove', label: 'Move Tool', category: 'Design tools', icon: '/iconset/runCursor.svg', scope: 'design', shortcutLabel: 'V', run: () => window.dispatchEvent(new CustomEvent('fractaldesign:tool', { detail: 'move' })) },
	{ id: 'designer.toolScale', label: 'Scale Tool', category: 'Design tools', icon: '/iconset/moveToRightBottom.svg', scope: 'design', shortcutLabel: 'K', run: () => window.dispatchEvent(new CustomEvent('fractaldesign:tool', { detail: 'scale' })) },
]);

contributions.registerKeybindings([
	{ combo: 'cmd+0', commandId: 'designer.zoom100', scope: 'design' },
	{ combo: 'cmd+1', commandId: 'designer.zoomFit', scope: 'design' },
	{ combo: 'cmd+2', commandId: 'designer.zoomSelection', scope: 'design' },
	{ combo: 'cmd+=', commandId: 'designer.zoomIn', scope: 'design' },
	{ combo: 'cmd+-', commandId: 'designer.zoomOut', scope: 'design' }
]);
