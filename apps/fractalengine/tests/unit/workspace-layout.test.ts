import { describe, expect, it } from 'vitest';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';

describe('workspace layout profiles', () => {
	it('isolates collapsed state and undo history by module profile', () => {
		const codeInitiallyCollapsed = workspaceLayout.isCollapsed('code', 'left');
		const designInitiallyCollapsed = workspaceLayout.isCollapsed('design', 'left');

		workspaceLayout.setCollapsed('code', 'left', !codeInitiallyCollapsed);

		expect(workspaceLayout.isCollapsed('code', 'left')).toBe(!codeInitiallyCollapsed);
		expect(workspaceLayout.isCollapsed('design', 'left')).toBe(designInitiallyCollapsed);
		expect(workspaceLayout.historyForUndo('code').canUndo).toBe(true);
		expect(workspaceLayout.historyForUndo('design').canUndo).toBe(false);

		workspaceLayout.undo('code');

		expect(workspaceLayout.isCollapsed('code', 'left')).toBe(codeInitiallyCollapsed);
		expect(workspaceLayout.isCollapsed('design', 'left')).toBe(designInitiallyCollapsed);
	});
});
