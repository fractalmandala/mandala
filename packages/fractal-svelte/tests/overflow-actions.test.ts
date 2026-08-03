import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { OverflowActions } from '../src/lib/components/blocks/overflow-actions/index.js';
const items = [{ id: 'edit', label: 'Edit' }, { id: 'delete', label: 'Delete', variant: 'destructive' as const }];
describe('OverflowActions', () => {
	it('opens as a menu, supports arrow navigation and invokes actions', async () => { const action = vi.fn(); render(OverflowActions, { props: { items, onAction: action } }); const trigger = screen.getByRole('button', { name: 'More actions' }); await fireEvent.keyDown(trigger, { key: 'ArrowDown' }); expect(screen.getByRole('menu')).toBeTruthy(); const edit = screen.getByRole('menuitem', { name: 'Edit' }); expect(document.activeElement).toBe(edit); await fireEvent.keyDown(edit, { key: 'ArrowDown' }); expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' })); await fireEvent.click(edit); expect(action).toHaveBeenCalledWith(items[0]); expect(screen.queryByRole('menu')).toBeNull(); });
	it('closes with Escape and returns focus', async () => { render(OverflowActions, { props: { items } }); const trigger = screen.getByRole('button', { name: 'More actions' }); await fireEvent.click(trigger); await fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' }); expect(document.activeElement).toBe(trigger); });
});
