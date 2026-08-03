import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { ExpandableActionBar } from '../src/lib/components/blocks/expandable-action-bar/index.js';
const items = [{ id: 'send', label: 'Send', icon: undefined as never }, { id: 'copy', label: 'Copy', icon: undefined as never, disabled: true }];
describe('ExpandableActionBar', () => {
	it('expands on focus and invokes actions', async () => { const action = vi.fn(); render(ExpandableActionBar, { props: { items, onAction: action } }); const bar = screen.getByRole('toolbar'); const send = screen.getByRole('button', { name: 'Send' }); await fireEvent.focusIn(send); expect(bar.getAttribute('data-expanded')).toBe('true'); await fireEvent.click(send); expect(action).toHaveBeenCalledWith(items[0]); });
	it('exposes disabled action state', () => { render(ExpandableActionBar, { props: { items } }); expect((screen.getByRole('button', { name: 'Copy' }) as HTMLButtonElement).disabled).toBe(true); });
});
