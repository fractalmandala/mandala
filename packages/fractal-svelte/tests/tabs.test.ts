import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { Tabs } from '../src/lib/components/motion/tabs/index.js';

const tabs = [{ id: 'one', label: 'One' }, { id: 'skip', label: 'Skip', disabled: true }, { id: 'three', label: 'Three' }];

describe('Tabs', () => {
	it('links the active tab and panel with roving tabindex', () => {
		const children = (tab: { label: string }) => tab.label;
		const { container } = render(Tabs, { props: { tabs, activeId: 'one', children } as never });
		const triggers = container.querySelectorAll<HTMLElement>('[role="tab"]');
		expect(triggers[0].tabIndex).toBe(0);
		expect(triggers[2].tabIndex).toBe(-1);
		expect(triggers[0].getAttribute('aria-controls')).toBe('tabpanel-one');
		expect(container.querySelector('[role="tabpanel"]')?.getAttribute('aria-labelledby')).toBe('tab-one');
	});

	it('navigates with arrows and skips disabled tabs', async () => {
		const onchange = vi.fn();
		const { container } = render(Tabs, { props: { tabs, activeId: 'one', onchange } });
		const triggers = container.querySelectorAll<HTMLElement>('[role="tab"]');
		await fireEvent.keyDown(triggers[0], { key: 'ArrowRight' });
		expect(onchange).toHaveBeenCalledWith('three');
		expect(document.activeElement).toBe(triggers[2]);
	});

	it('supports Home and End navigation', async () => {
		const onchange = vi.fn();
		const { container } = render(Tabs, { props: { tabs, activeId: 'three', onchange } });
		const triggers = container.querySelectorAll<HTMLElement>('[role="tab"]');
		await fireEvent.keyDown(triggers[2], { key: 'Home' });
		expect(onchange).toHaveBeenCalledWith('one');
	});
});
