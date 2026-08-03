import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { Switch } from '../src/lib/components/motion/switch/index.js';
import { Checkbox } from '../src/lib/components/motion/checkbox/index.js';
import { RadioGroup } from '../src/lib/components/motion/radio/index.js';

describe('motion choices', () => {
	it('toggles switch from its associated label', async () => {
		const onchange = vi.fn();
		const { getByText, getByRole } = render(Switch, { props: { label: 'Notifications', onchange } });
		await fireEvent.click(getByText('Notifications'));
		expect(getByRole('switch').getAttribute('aria-checked')).toBe('true');
		expect(onchange).toHaveBeenCalledWith(true);
	});

	it('reports mixed checkbox state and resolves it on activation', async () => {
		const onchange = vi.fn();
		const { getByRole } = render(Checkbox, { props: { indeterminate: true, checked: false, onchange } });
		const checkbox = getByRole('checkbox');
		expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
		await fireEvent.click(checkbox);
		expect(onchange).toHaveBeenCalledWith(true);
	});

	it('moves radio selection with arrows while skipping disabled items', async () => {
		const onchange = vi.fn();
		const items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', disabled: true }, { value: 'c', label: 'C' }];
		const { getAllByRole } = render(RadioGroup, { props: { items, value: 'a', onchange } });
		await fireEvent.keyDown(getAllByRole('radio')[0], { key: 'ArrowDown' });
		expect(onchange).toHaveBeenCalledWith('c');
		expect(document.activeElement).toBe(getAllByRole('radio')[2]);
	});
});
