import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { BouncyAccordion } from '../src/lib/components/blocks/bouncy-accordion/index.js';

const items = [{ id: 'one', title: 'One', description: 'First' }, { id: 'two', title: 'Two', description: 'Second', disabled: true }];

describe('BouncyAccordion', () => {
	it('associates triggers and regions and toggles a single panel', async () => {
		const change = vi.fn();
		render(BouncyAccordion, { props: { items, onValueChange: change } });
		const trigger = screen.getByRole('button', { name: 'One' });
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		await fireEvent.click(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		const region = screen.getByRole('region');
		expect(trigger.getAttribute('aria-controls')).toBe(region.id);
		expect(change).toHaveBeenCalledWith('one');
	});

	it('respects disabled items and non-collapsible mode', async () => {
		render(BouncyAccordion, { props: { items, defaultValue: 'one', collapsible: false } });
		await fireEvent.click(screen.getByRole('button', { name: 'One' }));
		expect(screen.getByRole('button', { name: 'One' }).getAttribute('aria-expanded')).toBe('true');
		expect((screen.getByRole('button', { name: 'Two' }) as HTMLButtonElement).disabled).toBe(true);
	});
});
