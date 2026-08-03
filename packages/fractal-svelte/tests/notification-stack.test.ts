import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { NotificationStack } from '../src/lib/components/blocks/notification-stack/index.js';
const items = [{ id: 'one', title: 'First', description: 'Detail', actionLabel: 'Retry' }, { id: 'two', title: 'Second' }];
describe('NotificationStack', () => {
	it('expands on click and invokes item and footer actions', async () => {
		const action = vi.fn(); const view = vi.fn(); render(NotificationStack, { props: { items, onAction: action, onViewAll: view } });
		const footer = screen.getByRole('button', { name: /Notifications/ }); await fireEvent.click(footer);
		expect(footer.getAttribute('aria-expanded')).toBe('true'); await fireEvent.click(screen.getByRole('button', { name: 'Retry' })); expect(action).toHaveBeenCalledWith(items[0]);
		await fireEvent.click(footer); expect(view).toHaveBeenCalled();
	});
	it('dismisses on a horizontal swipe', async () => {
		const dismiss = vi.fn(); render(NotificationStack, { props: { items, onDismiss: dismiss } }); const card = screen.getByText('First').closest('article')!;
		await fireEvent.pointerDown(card, { clientX: 10 }); await fireEvent.pointerUp(card, { clientX: 100 }); expect(dismiss).toHaveBeenCalledWith(items[0]);
	});
});
