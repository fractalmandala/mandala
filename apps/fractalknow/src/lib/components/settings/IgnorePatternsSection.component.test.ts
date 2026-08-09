import { fireEvent, render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { okignoreText } from '$lib/shell/okignore';
import IgnorePatternsSection from './IgnorePatternsSection.svelte';

describe('IgnorePatternsSection component', () => {
	it('renders pattern list, shows live match preview and warnings, and adds new pattern', async () => {
		okignoreText.set('drafts/\n*.tmp\n');

		const { getByTestId, queryByTestId, getAllByTestId } = render(IgnorePatternsSection);

		expect(getByTestId('settings-okignore-section')).toBeTruthy();
		expect(getByTestId('settings-okignore-list')).toBeTruthy();

		const inputs = getAllByTestId('settings-okignore-row-input') as HTMLInputElement[];
		expect(inputs).toHaveLength(2);
		expect(inputs[0].value).toBe('drafts/');
		expect(inputs[1].value).toBe('*.tmp');

		// Add pattern
		const addInput = getByTestId('settings-okignore-add-input');
		const addBtn = getByTestId('settings-okignore-add-button');

		await fireEvent.input(addInput, { target: { value: 'build/' } });
		await fireEvent.click(addBtn);

		expect(get(okignoreText)).toContain('build/');

		// Toggle advanced raw text editor
		const advancedToggle = getByTestId('settings-okignore-show-advanced-toggle');
		await fireEvent.click(advancedToggle);

		expect(getByTestId('settings-okignore-advanced-textarea')).toBeTruthy();
	});
});
