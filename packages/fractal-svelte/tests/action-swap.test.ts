import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { ActionSwap } from '../src/lib/components/blocks/action-swap/index.js';

describe('ActionSwap', () => {
	it('cycles items and reports the selected item', async () => {
		const change = vi.fn();
		render(ActionSwap, { props: { items: [{ id: 'copy', label: 'Copy' }, { id: 'done', label: 'Copied' }], onValueChange: change } });
		await fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
		expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
		expect(change).toHaveBeenCalledWith('done', expect.objectContaining({ id: 'done' }));
	});

	it('does not cycle when cycle is false', async () => {
		render(ActionSwap, { props: { items: [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }], cycle: false } });
		await fireEvent.click(screen.getByRole('button', { name: 'One' }));
		expect(screen.queryByText('Two')).toBeNull();
	});
});
