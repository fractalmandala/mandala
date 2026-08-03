import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import TodoList from '../src/lib/components/agents/todo-list/todo-list.svelte';
describe('TodoList', () => {
	it('is an accessible collapsible plan', async () => {
		const change = vi.fn();
		render(TodoList, {
			props: { items: [{ id: '1', title: 'Check', status: 'pending' }], onOpenChange: change }
		});
		const trigger = screen.getByRole('button');
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		await fireEvent.click(trigger);
		expect(change).toHaveBeenCalledWith(false);
	});
	it('announces completion count', () => {
		render(TodoList, {
			props: {
				items: [{ id: '1', title: 'Done', status: 'completed' }],
				collapseOnComplete: false
			}
		});
		expect(screen.getByText('1 of 1 tasks completed')).toBeTruthy();
	});
});
