import { fireEvent, render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { validationConfig } from '$lib/shell/config';
import ContentRulesSection from './ContentRulesSection.svelte';

describe('ContentRulesSection component', () => {
	it('renders rule rows and controls, toggling rules and updating severities', async () => {
		const { getByTestId } = render(ContentRulesSection);

		expect(getByTestId('settings-content-rules')).toBeTruthy();
		expect(getByTestId('rule-row-frontmatter')).toBeTruthy();
		expect(getByTestId('rule-row-links')).toBeTruthy();
		expect(getByTestId('rule-row-heading')).toBeTruthy();
		expect(getByTestId('rule-row-trailing')).toBeTruthy();

		const headingSelect = getByTestId('select-heading-severity') as HTMLSelectElement;
		await fireEvent.change(headingSelect, { target: { value: 'warning' } });

		expect(get(validationConfig).headingSeverity).toBe('warning');

		const frontmatterToggle = getByTestId('toggle-frontmatter-rule') as HTMLInputElement;
		await fireEvent.click(frontmatterToggle);

		expect(get(validationConfig).frontmatterValidation).toBe(false);
	});
});
