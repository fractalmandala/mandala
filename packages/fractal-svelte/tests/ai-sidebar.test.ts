import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import AISidebar from '../src/lib/components/agents/ai-sidebar/ai-sidebar.svelte';
describe('AISidebar', () => {
	it('implements tree keyboard navigation and selection', async () => {
		const active = vi.fn();
		render(AISidebar, {
			props: {
				defaultItems: [
					{
						id: 'p',
						label: 'Project',
						kind: 'project',
						children: [{ id: 'f', label: 'File', kind: 'file' }]
					}
				],
				defaultExpandedIds: ['p'],
				onActiveChange: active
			}
		});
		const rows = screen.getAllByRole('treeitem');
		rows[0].focus();
		await fireEvent.keyDown(rows[0], { key: 'ArrowDown' });
		await waitFor(() => expect(document.activeElement).toBe(rows[1]));
		await fireEvent.keyDown(rows[1], { key: 'Enter' });
		expect(active).toHaveBeenCalledWith('f');
	});
	it('renames with F2', async () => {
		const rename = vi.fn();
		render(AISidebar, {
			props: { defaultItems: [{ id: 'f', label: 'File', kind: 'file' }], onRename: rename }
		});
		const row = screen.getByRole('treeitem');
		row.focus();
		await fireEvent.keyDown(row, { key: 'F2' });
		const input = screen.getByLabelText('Rename File');
		await fireEvent.input(input, { target: { value: 'New' } });
		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(rename).toHaveBeenCalledWith(expect.objectContaining({ id: 'f' }), 'New');
	});
});
